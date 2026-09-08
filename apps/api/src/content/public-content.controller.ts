import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { PublicContentService } from './public-content.service';
@ApiTags('public/content')
@Controller('public')
export class PublicContentController {
  constructor(private readonly content: PublicContentService) {}
  @Get('languages') async languages() {
    return { data: await this.content.languages() };
  }
  @Get('settings') async settings(@Query('locale') locale?: string) {
    return { data: await this.content.settings(locale) };
  }
  @Get('navigation/:key') async navigation(
    @Param('key') key: string,
    @Query('locale') locale: string,
  ) {
    return { data: await this.content.navigation(locale, key) };
  }
  @Get('redirect') async redirect(@Query('path') path: string) {
    return { data: await this.content.redirect(path) };
  }
  @Get(':resource')
  @ApiOperation({ summary: 'Published localized content with filters and pagination' })
  @ApiQuery({ name: 'locale', required: true })
  async list(
    @Param('resource') resource: string,
    @Query() query: Record<string, string | undefined>,
  ) {
    return this.content.list(resource, query);
  }
  @Get(':resource/:slug')
  @ApiQuery({ name: 'locale', required: true })
  async detail(
    @Param('resource') resource: string,
    @Param('slug') slug: string,
    @Query('locale') locale: string,
    @Query('preview') preview?: string,
  ) {
    return { data: await this.content.detail(resource, locale, slug, preview) };
  }
}
