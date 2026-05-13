import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateLiveDto } from './dto/create-live.dto';
import { UpdateLiveDto } from './dto/update-live.dto';
import { UpdateChannelSettingsDto } from './dto/update-channel-settings.dto';
import { LivesService } from './lives.service';

@Controller()
export class LivesController {
  private readonly logger = new Logger(LivesController.name);

  constructor(private readonly livesService: LivesService) {}

  // ---------- Channel settings ----------

  @Get('live-settings')
  getChannelSettings() {
    return this.livesService.getChannelSettings();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('live-settings')
  updateChannelSettings(@Body() dto: UpdateChannelSettingsDto) {
    this.logger.log(
      `PATCH /live-settings (name=${dto.channelName ?? 'unchanged'}, url=${dto.channelUrl ?? 'unchanged'})`,
    );
    return this.livesService.updateChannelSettings(dto);
  }

  // ---------- Lives ----------

  @Get('lives')
  findAll(@Query('eventId') eventId?: string) {
    return this.livesService.findAll({
      eventId: eventId?.trim() || undefined,
    });
  }

  @Get('lives/:id')
  findOne(@Param('id') id: string) {
    return this.livesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('lives')
  @UseInterceptors(FileInterceptor('coverImage'))
  create(
    @Body() dto: CreateLiveDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.log(
      `POST /lives (eventId=${dto.eventId}, startTime=${dto.startTime}, hasCover=${!!file})`,
    );
    return this.livesService.create(dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('lives/:id')
  @UseInterceptors(FileInterceptor('coverImage'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLiveDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.log(
      `PATCH /lives/${id} (hasCover=${!!file}, removeCoverImage=${dto.removeCoverImage})`,
    );
    return this.livesService.update(id, dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('lives/:id')
  remove(@Param('id') id: string) {
    return this.livesService.remove(id);
  }
}
