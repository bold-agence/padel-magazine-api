import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ReplaceFipRankingDto } from './dto/replace-fip-ranking.dto';
import { FipRankingsService } from './fip-rankings.service';

@Controller('fip-rankings')
export class FipRankingsController {
  constructor(private readonly fipRankingsService: FipRankingsService) {}

  @Get('top10')
  findPublishedTop10() {
    return this.fipRankingsService.findPublishedTop10();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  findAllForAdmin() {
    return this.fipRankingsService.findAllForAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Post('player-image')
  @UseInterceptors(
    FileInterceptor('playerImage', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  uploadPlayerImage(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Fichier manquant');
    }
    return this.fipRankingsService
      .uploadPlayerImage(file)
      .then((url) => ({ url }));
  }

  @UseGuards(JwtAuthGuard)
  @Put(':gender')
  replaceByGender(
    @Param('gender') gender: string,
    @Body() dto: ReplaceFipRankingDto,
  ) {
    return this.fipRankingsService.replaceByGender(gender, dto);
  }
}
