import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { cmsDefinitions, paginationSchema, safeHref } from '@gatevia/contracts';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { Row, ContentDelegate } from './admin-content.service';

const localizedText = z.union([z.string().max(5000), z.record(z.string().max(5000))]);
export const settingSchemas: Record<string, z.ZodTypeAny> = {
  'company.name': localizedText, 'company.legal_name': localizedText, 'company.logo_media_id': z.string().uuid().nullable(),
  'contact.email': z.string().email().or(z.literal('')), 'contact.phone': z.string().max(40), 'contact.address': localizedText,
  'social.linkedin': z.string().url().refine(v => /^https:\/\/(www\.)?linkedin\.com\//i.test(v)).or(z.literal('')),
  'seo.default_title': localizedText, 'seo.default_description': localizedText, 'seo.default_og_media_id': z.string().uuid().nullable(),
  'analytics.ga4_id': z.string().regex(/^G-[A-Z0-9]+$|^$/), 'analytics.gtm_id': z.string().regex(/^GTM-[A-Z0-9]+$|^$/),
  'forms.notification_recipients': z.array(z.string().email()).max(20),
};
const pathSchema = z.string().max(2000).regex(/^\/(?!\/)[^?#\\\s]*$/).transform(v => v.length > 1 ? v.replace(/\/$/, '') : v);
const itemSchema = z.object({ id: z.string().uuid(), parentId: z.string().uuid().nullable(), itemType: z.enum(['internal', 'external']), internalEntityType: z.string().nullable().optional(), internalEntityId: z.string().uuid().nullable().optional(), externalUrl: safeHref.nullable().optional(), visible: z.boolean(), translations: z.record(z.object({ label: z.string().trim().min(1).max(120) }).strict()) }).strict();
export function contentPath(resource: string, locale: string, slug: string) { return `/${locale.toLowerCase()}/${resource === 'pages' ? (slug === 'home' ? '' : encodeURIComponent(slug)) : `${resource}/${encodeURIComponent(slug)}`}`; }

@Injectable()
export class WebsiteContentService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  async assertLocales(codes: string[]) { const count = await this.prisma.language.count({ where: { code: { in: codes }, isActive: true } }); if (count !== codes.length) throw new BadRequestException('Translation locales must be active language codes.'); }
  private model(resource: string) { const model = ({ navigation: 'navigationMenu', settings: 'globalSetting', redirects: 'redirect' } as Record<string,string>)[resource]; if (!model) throw new NotFoundException('Unknown resource.'); return (this.prisma as unknown as Record<string,ContentDelegate>)[model]!; }
  async list(resource: string, raw: Record<string,string|undefined>) {
    const q = paginationSchema.extend({ q: z.string().max(200).optional(), status: z.string().optional(), sort: z.string().optional() }).strict().parse(raw);
    const fields = resource === 'redirects' ? ['sourcePath','destinationPath'] : ['key'];
    const where = { ...(q.q ? { OR: fields.map(f => ({ [f]: { contains: q.q, mode: 'insensitive' } })) } : {}), ...(q.status && resource === 'navigation' ? { status: z.enum(['draft','review','published','archived']).parse(q.status) } : {}) };
    const [data,total] = await Promise.all([this.model(resource).findMany({ where, skip:(q.page-1)*q.pageSize,take:q.pageSize,orderBy:{updatedAt:'desc'} }),this.model(resource).count({where})]);
    return {data,meta:{page:q.page,pageSize:q.pageSize,total,pageCount:Math.ceil(total/q.pageSize)}};
  }
  async detail(resource:string,id:string) { const data = await this.model(resource).findUnique({where: resource==='settings'?{key:id}:{id:z.string().uuid().parse(id)},...(resource==='navigation'?{include:{items:{include:{translations:true},orderBy:{sortOrder:'asc'}}}}:{})}); if(!data)throw new NotFoundException('Resource was not found.');return data; }
  async validateRedirect(tx: Prisma.TransactionClient, sourcePath:string,destinationPath:string,id?:string) {
    if(sourcePath===destinationPath)throw new ConflictException('Redirect cannot target itself.');
    const rows = await tx.redirect.findMany({where:{active:true,...(id?{id:{not:id}}:{})}});
    const map=new Map(rows.map(r=>[r.sourcePath,r.destinationPath]));map.set(sourcePath,destinationPath);
    for(const start of map.keys()){const visited=new Set<string>();let current=start;while(map.has(current)){if(visited.has(current))throw new ConflictException('Redirect loop detected.');visited.add(current);current=map.get(current)!;}}
  }
  async slugRedirects(tx:Prisma.TransactionClient,resource:string,before:Row,translations:Record<string,Record<string,unknown>>) {
    for(const old of before.translations??[]){const next=translations[String(old.locale)];if(!old.slug||!next?.slug||next.slug===old.slug)continue;const sourcePath=contentPath(resource,String(old.locale),String(old.slug));const destinationPath=contentPath(resource,String(old.locale),String(next.slug));
      // Reusing a previous slug must remove its old redirect before creating the reverse mapping.
      await tx.redirect.updateMany({where:{sourcePath:destinationPath},data:{active:false}});
      const previous=await tx.redirect.findUnique({where:{sourcePath}});await this.validateRedirect(tx,sourcePath,destinationPath,previous?.id);
      await tx.redirect.upsert({where:{sourcePath},create:{sourcePath,destinationPath,statusCode:301,locale:String(old.locale),active:true},update:{destinationPath,statusCode:301,active:true}});
    }
  }
  async save(resource:string,id:string|undefined,raw:Record<string,unknown>,actorUserId:string,requestId:string) {
    if(resource==='settings') {
      if(!id||!settingSchemas[id])throw new BadRequestException('Unknown typed setting key.');
      const {value}=z.object({value:settingSchemas[id]}).strict().parse(raw);
      if(value&&typeof value==='object'&&!Array.isArray(value))await this.assertLocales(Object.keys(value));
      if(id.endsWith('_media_id')&&value&&!await this.prisma.media.findFirst({where:{id:String(value),status:'ready'}}))throw new BadRequestException('Choose ready media.');
      const row=await this.prisma.globalSetting.update({where:{key:id},data:{value:value===null?Prisma.JsonNull:value as Prisma.InputJsonValue,updatedById:actorUserId}});
      await this.audit.record({actorUserId,action:'settings.updated',entityType:'settings',entityId:row.id,requestId});return row;
    }
    if(resource==='redirects') {
      const data=z.object({sourcePath:pathSchema,destinationPath:pathSchema,statusCode:z.union([z.literal(301),z.literal(302),z.literal(307),z.literal(308)]),locale:z.string().nullable().optional(),active:z.boolean()}).strict().parse(raw);
      if(data.locale)await this.assertLocales([data.locale]);
      return this.prisma.$transaction(async tx=>{if(data.active)await this.validateRedirect(tx,data.sourcePath,data.destinationPath,id);const row=id?await tx.redirect.update({where:{id},data}):await tx.redirect.create({data});await tx.auditLog.create({data:{actorUserId,action:'redirect.saved',entityType:resource,entityId:row.id,requestId}});return row;});
    }
    if(resource!=='navigation')throw new NotFoundException('Unknown resource.');
    const data=z.object({key:z.string().regex(/^[a-z][a-z0-9-]{1,80}$/),location:z.string().min(1).max(120),status:z.enum(['draft','review']).optional(),items:z.array(itemSchema).max(200)}).strict().parse(raw);
    const ids=new Set(data.items.map(i=>i.id));if(ids.size!==data.items.length)throw new BadRequestException('Duplicate menu item IDs.');
    const byId=new Map(data.items.map(i=>[i.id,i]));
    for(const item of data.items){await this.assertLocales(Object.keys(item.translations));if(item.parentId&&!ids.has(item.parentId))throw new BadRequestException('Parent must be in the same menu.');const visited=new Set([item.id]);let parent=item.parentId;while(parent){if(visited.has(parent))throw new BadRequestException('Menu hierarchy contains a cycle.');visited.add(parent);parent=byId.get(parent)!.parentId;}
      if(item.itemType==='external'){if(!item.externalUrl||!/^https?:\/\//.test(item.externalUrl))throw new BadRequestException('External links require an HTTP(S) URL.');}
      else {const def=cmsDefinitions[item.internalEntityType??''];if(!def||!def.translations.slug||!item.internalEntityId)throw new BadRequestException('Select a routable internal content target.');const delegate=(this.prisma as unknown as Record<string,ContentDelegate>)[def.model]!;if(!await delegate.findUnique({where:{id:item.internalEntityId}}))throw new BadRequestException('Internal target does not exist.');}
    }
    return this.prisma.$transaction(async tx=>{const {items,...values}=data;const menu=id?await tx.navigationMenu.update({where:{id},data:values}):await tx.navigationMenu.create({data:values});await tx.navigationItem.deleteMany({where:{menuId:menu.id}});
      // Create parents first, retaining editor IDs, then descendants at arbitrary depth.
      const pending=[...items];const inserted=new Set<string>();while(pending.length){const index=pending.findIndex(i=>!i.parentId||inserted.has(i.parentId));const item=pending.splice(index,1)[0]!;await tx.navigationItem.create({data:{id:item.id,menuId:menu.id,parentId:item.parentId,itemType:item.itemType,internalEntityType:item.itemType==='internal'?item.internalEntityType:null,internalEntityId:item.itemType==='internal'?item.internalEntityId:null,externalUrl:item.itemType==='external'?item.externalUrl:null,visible:item.visible,sortOrder:items.indexOf(item),translations:{create:Object.entries(item.translations).map(([locale,t])=>({locale,label:t.label}))}}});inserted.add(item.id);}
      await tx.auditLog.create({data:{actorUserId,action:'navigation.saved',entityType:resource,entityId:menu.id,requestId}});return menu;
    });
  }
  async transition(resource:string,id:string,status:'draft'|'published'|'archived',actorUserId:string,requestId:string) {if(resource==='settings')throw new BadRequestException('Settings do not have publishing states.');const data=resource==='redirects'?{active:status==='published'}:{status};const result=await this.model(resource).update({where:{id},data});await this.audit.record({actorUserId,action:`${resource}.${status}`,entityType:resource,entityId:id,requestId});return result;}
}
