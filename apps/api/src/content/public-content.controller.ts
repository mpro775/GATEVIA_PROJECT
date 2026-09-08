import { Controller, Get, Param, Query } from '@nestjs/common'; import { ApiTags } from '@nestjs/swagger'; import { PublicContentService } from './public-content.service';
@ApiTags('public/content') @Controller('public') export class PublicContentController {
  constructor(private readonly content: PublicContentService) {}
  @Get('languages') async languages() { return { data: await this.content.languages() }; }
  @Get('pages/:slug') async page(@Param('slug') slug: string, @Query('locale') locale: string) { return { data: await this.content.page(locale, slug) }; }
  @Get('services') async services(@Query('locale') locale: string) { return { data: await this.content.services(locale) }; }
  @Get('services/:slug') async service(@Param('slug') slug: string, @Query('locale') locale: string) { return { data: await this.content.service(locale, slug) }; }
  @Get('industries') async industries(@Query('locale') locale: string) { return { data: await this.content.industries(locale) }; }
  @Get('industries/:slug') async industry(@Param('slug') slug: string, @Query('locale') locale: string) { return { data: await this.content.industry(locale, slug) }; }
  @Get('insights') async insights(@Query('locale') locale: string, @Query('type') type?: 'article' | 'guide' | 'report', @Query('q') q?: string) { return { data: await this.content.insights(locale, type, q) }; }
  @Get('insights/:slug') async insight(@Param('slug') slug: string, @Query('locale') locale: string) { return { data: await this.content.insight(locale, slug) }; }
  @Get('case-studies') async caseStudies(@Query('locale') locale: string) { return { data: await this.content.caseStudies(locale) }; }
  @Get('case-studies/:slug') async caseStudy(@Param('slug') slug: string, @Query('locale') locale: string) { return { data: await this.content.caseStudy(locale, slug) }; }
  @Get('team') async team(@Query('locale') locale: string) { return { data: await this.content.team(locale) }; }
  @Get('faqs') async faqs(@Query('locale') locale: string) { return { data: await this.content.faqs(locale) }; }
  @Get('settings') async settings() { return { data: await this.content.settings() }; }
  @Get('navigation/:key') async navigation(@Param('key') key: string, @Query('locale') locale: string) { return { data: await this.content.navigation(locale, key) }; }
  @Get('clients') async clients(@Query('locale') locale: string) { return { data: await this.content.trust(locale, 'clients') }; }
  @Get('partners') async partners(@Query('locale') locale: string) { return { data: await this.content.trust(locale, 'partners') }; }
  @Get('certifications') async certifications(@Query('locale') locale: string) { return { data: await this.content.trust(locale, 'certifications') }; }
  @Get('trust-metrics') async trustMetrics(@Query('locale') locale: string) { return { data: await this.content.trust(locale, 'trust-metrics') }; }
  @Get('brands') async brands(@Query('locale') locale: string) { return { data: await this.content.ecosystem(locale, 'brands') }; }
  @Get('products') async products(@Query('locale') locale: string) { return { data: await this.content.ecosystem(locale, 'products') }; }
  @Get('brands/:slug') async brand(@Param('slug') slug: string, @Query('locale') locale: string) { return { data: await this.content.ecosystemDetail(locale, 'brands', slug) }; }
  @Get('products/:slug') async product(@Param('slug') slug: string, @Query('locale') locale: string) { return { data: await this.content.ecosystemDetail(locale, 'products', slug) }; }
  @Get('testimonials') async testimonials(@Query('locale') locale: string) { return { data: await this.content.testimonials(locale) }; }
}
