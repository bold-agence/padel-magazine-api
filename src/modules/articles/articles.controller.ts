import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(@Body() dto: CreateArticleDto) {
    return this.articlesService.create(dto);
  }

  @Post('banner-image')
  @UseInterceptors(FileInterceptor('bannerImage'))
  uploadBannerImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      return { url: null };
    }
    return this.articlesService
      .uploadBannerImage(file)
      .then((url) => ({ url }));
  }

  @Get()
  findAll() {
    return this.articlesService.findAll();
  }

  @Get('paginated')
  findPaginated(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(9), ParseIntPipe) limit: number,
    @Query('category', new DefaultValuePipe('all')) category: string,
    @Query('includeHidden', new DefaultValuePipe(false), ParseBoolPipe)
    includeHidden: boolean,
  ) {
    return this.articlesService.findPaginated(
      page,
      limit,
      category,
      includeHidden,
    );
  }

  @Get('popular')
  findPopular(
    @Query('limit', new DefaultValuePipe(5), ParseIntPipe) limit: number,
    @Query('category', new DefaultValuePipe('all')) category: string,
    @Query('excludeSlug') excludeSlug?: string,
    @Query('mode', new DefaultValuePipe('popular')) mode?: string,
  ) {
    return this.articlesService.findPopular(limit, category, excludeSlug, mode);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.articlesService.findBySlug(slug);
  }

  @Post('slug/:slug/view')
  trackViewBySlug(@Param('slug') slug: string) {
    return this.articlesService
      .trackViewBySlug(slug)
      .then(() => ({ success: true }));
  }

  @Get('slug/:slug/related')
  findRelatedBySlug(@Param('slug') slug: string) {
    return this.articlesService.findRelatedBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateArticleDto,
  ) {
    return this.articlesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.articlesService.remove(id);
  }
}
