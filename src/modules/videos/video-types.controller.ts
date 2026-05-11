import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VideoTypesService } from './video-types.service';
import { CreateVideoTypeDto } from './dto/create-video-type.dto';
import { UpdateVideoTypeDto } from './dto/update-video-type.dto';

@Controller('video-types')
export class VideoTypesController {
  constructor(private readonly videoTypesService: VideoTypesService) {}

  @Get()
  findAll() {
    return this.videoTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.videoTypesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateVideoTypeDto) {
    return this.videoTypesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateVideoTypeDto,
  ) {
    return this.videoTypesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.videoTypesService.remove(id);
  }
}
