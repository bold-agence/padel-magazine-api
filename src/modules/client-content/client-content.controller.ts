import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientContentService } from './client-content.service';
import { CreateAdImageDto } from './dto/create-ad-image.dto';
import { CreateBreakingNewsDto } from './dto/create-breaking-news.dto';
import { UpdateAdImageDto } from './dto/update-ad-image.dto';
import { UpdateBreakingNewsDto } from './dto/update-breaking-news.dto';

@Controller('client-content')
export class ClientContentController {
  constructor(private readonly clientContentService: ClientContentService) {}

  @Post('ad-images/upload')
  @UseInterceptors(FileInterceptor('image'))
  uploadAdImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      return { url: null };
    }
    return this.clientContentService.uploadAdImage(file).then((url) => ({ url }));
  }

  @Post('breaking-news')
  createBreakingNews(@Body() dto: CreateBreakingNewsDto) {
    return this.clientContentService.createBreakingNews(dto);
  }

  @Get('breaking-news')
  findAllBreakingNews(
    @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe)
    activeOnly: boolean,
  ) {
    return this.clientContentService.findAllBreakingNews(activeOnly);
  }

  @Get('breaking-news/:id')
  findOneBreakingNews(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.clientContentService.findOneBreakingNews(id);
  }

  @Patch('breaking-news/:id')
  updateBreakingNews(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateBreakingNewsDto,
  ) {
    return this.clientContentService.updateBreakingNews(id, dto);
  }

  @Delete('breaking-news/:id')
  removeBreakingNews(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.clientContentService.removeBreakingNews(id);
  }

  @Post('ad-images')
  createAdImage(@Body() dto: CreateAdImageDto) {
    return this.clientContentService.createAdImage(dto);
  }

  @Get('ad-images')
  findAllAdImages(
    @Query('slot') slot?: string,
    @Query('activeOnly', new DefaultValuePipe(false), ParseBoolPipe)
    activeOnly?: boolean,
  ) {
    const safeSlot =
      slot === 'header_main' || slot === 'sidebar_top' || slot === 'sidebar_bottom'
        ? slot
        : undefined;
    return this.clientContentService.findAllAdImages(safeSlot, activeOnly);
  }

  @Get('ad-images/:id')
  findOneAdImage(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.clientContentService.findOneAdImage(id);
  }

  @Patch('ad-images/:id')
  updateAdImage(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateAdImageDto,
  ) {
    return this.clientContentService.updateAdImage(id, dto);
  }

  @Delete('ad-images/:id')
  removeAdImage(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.clientContentService.removeAdImage(id);
  }
}
