import { PrismaClient } from '@prisma/client';
import { grants, permissions, roles } from './catalog';

const prisma = new PrismaClient();

async function seed() {
  await prisma.$transaction(async (tx) => {
    await tx.language.upsert({
      where: { code: 'ar-SA' },
      create: {
        code: 'ar-SA',
        name: 'Arabic (Saudi Arabia)',
        nativeName: 'العربية',
        direction: 'rtl',
        isActive: true,
        isDefault: true,
        sortOrder: 0,
      },
      update: { name: 'Arabic (Saudi Arabia)', nativeName: 'العربية', direction: 'rtl' },
    });
    await tx.language.upsert({
      where: { code: 'en' },
      create: {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        direction: 'ltr',
        isActive: true,
        isDefault: false,
        sortOrder: 1,
      },
      update: { name: 'English', nativeName: 'English', direction: 'ltr' },
    });

    for (const key of permissions) {
      await tx.permission.upsert({ where: { key }, create: { key }, update: {} });
    }
    for (const key of roles) {
      const role = await tx.role.upsert({
        where: { key },
        create: { key, name: key.replaceAll('_', ' '), isSystem: true },
        update: { isSystem: true },
      });
      const permissionRows = await tx.permission.findMany({
        where: { key: { in: grants[key] } },
        select: { id: true },
      });
      await tx.rolePermission.deleteMany({
        where: { roleId: role.id, permissionId: { notIn: permissionRows.map((item) => item.id) } },
      });
      await tx.rolePermission.createMany({
        data: permissionRows.map((item) => ({ roleId: role.id, permissionId: item.id })),
        skipDuplicates: true,
      });
    }

    for (const key of [
      'main',
      'footer-services',
      'footer-company',
      'footer-resources',
      'footer-legal',
    ]) {
      await tx.navigationMenu.upsert({
        where: { key },
        create: { key, location: key, status: 'draft' },
        update: {},
      });
    }
    const settings = [
      ['company.name', 'company', '', true],
      ['company.legal_name', 'company', '', true],
      ['company.logo_media_id', 'company', null, true],
      ['contact.email', 'contact', '', true],
      ['contact.phone', 'contact', '', true],
      ['contact.address', 'contact', '', true],
      ['social.linkedin', 'social', '', true],
      ['seo.default_title', 'seo', '', true],
      ['seo.default_description', 'seo', '', true],
      ['seo.default_og_media_id', 'seo', null, true],
      ['analytics.ga4_id', 'analytics', '', true],
      ['analytics.gtm_id', 'analytics', '', true],
      ['forms.notification_recipients', 'forms', [], false],
    ] as const;
    for (const [key, category, value, isPublic] of settings) {
      await tx.globalSetting.upsert({
        where: { key },
        create: { key, category, value, isPublic },
        update: { isPublic },
      });
    }
  });
}

seed()
  .then(() => {
    console.info('System seed complete; no business or demo data was written.');
  })
  .finally(() => prisma.$disconnect());
