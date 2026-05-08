import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PortraitCategoriesService } from './portrait-categories.service';
import { CreatePortraitCategoryDto } from './dto/create-portrait-category.dto';
import { UpdatePortraitCategoryDto } from './dto/update-portrait-category.dto';

@Controller('portrait-categories')
export class PortraitCategoriesController {
  constructor(
    private readonly portraitCategoriesService: PortraitCategoriesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePortraitCategoryDto) {
    return this.portraitCategoriesService.create(dto);
  }

  @Get()
  findAll() {
    return this.portraitCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.portraitCategoriesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePortraitCategoryDto) {
    return this.portraitCategoriesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.portraitCategoriesService.remove(id);
  }
}

