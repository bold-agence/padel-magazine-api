import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClassementsService } from './classements.service';
import { CreateClassementDto } from './dto/create-classement.dto';
import { UpdateClassementDto } from './dto/update-classement.dto';
import { UpdateClassementPodiumDto } from './dto/update-classement-podium.dto';

@Controller('classements')
export class ClassementsController {
  constructor(private readonly classementsService: ClassementsService) {}

  @Get()
  findAllSummaries() {
    return this.classementsService.findAllSummaries();
  }

  @Get('by-slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.classementsService.findOneBySlugWithLines(slug);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.classementsService.findOneWithLines(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateClassementDto) {
    return this.classementsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/podium-images')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'podiumFirst', maxCount: 1 },
        { name: 'podiumSecond', maxCount: 1 },
        { name: 'podiumThird', maxCount: 1 },
      ],
      { limits: { fileSize: 5 * 1024 * 1024 } },
    ),
  )
  updatePodiumImages(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }))
    dto: UpdateClassementPodiumDto = {},
    @UploadedFiles()
    files?: {
      podiumFirst?: Express.Multer.File[];
      podiumSecond?: Express.Multer.File[];
      podiumThird?: Express.Multer.File[];
    },
  ) {
    return this.classementsService.updatePodiumImages(id, files ?? {}, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateClassementDto,
  ) {
    return this.classementsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.classementsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/import')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  importExcel(
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file?.buffer?.length) {
      throw new BadRequestException('Fichier manquant');
    }
    const name = file.originalname?.toLowerCase() ?? '';
    if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) {
      throw new BadRequestException('Extension autorisée: .xlsx ou .xls');
    }
    return this.classementsService.importExcel(id, file.buffer);
  }
}
