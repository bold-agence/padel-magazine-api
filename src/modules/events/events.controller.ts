import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateEventDto } from './dto/create-event.dto';
import { CreateEventTagDto } from './dto/create-event-tag.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventTagDto } from './dto/update-event-tag.dto';
import { EventTagsService } from './event-tags.service';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);

  constructor(
    private readonly eventsService: EventsService,
    private readonly eventTagsService: EventTagsService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('coverImage'))
  create(
    @Body() dto: CreateEventDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.log(
      `POST /events - create requested (title=${dto.title}, hasCover=${!!file})`,
    );
    return this.eventsService.create(dto, file);
  }

  @Get()
  findAll(
    @Query('tournamentId') tournamentId?: string,
    @Query('tournamentSlug') tournamentSlug?: string,
    @Query('tagId') tagId?: string,
  ) {
    return this.eventsService.findAll({
      tournamentId: tournamentId?.trim() || undefined,
      tournamentSlug: tournamentSlug?.trim() || undefined,
      tagId: tagId?.trim() || undefined,
    });
  }

  /** Routes tags avant `:id` pour éviter que « tags » soit pris pour un UUID. */
  @Get('tags')
  findAllTags() {
    return this.eventTagsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Post('tags')
  createTag(@Body() dto: CreateEventTagDto) {
    return this.eventTagsService.create(dto);
  }

  @Get('tags/:tagId')
  findOneTag(@Param('tagId', ParseUUIDPipe) tagId: string) {
    return this.eventTagsService.findOne(tagId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('tags/:tagId')
  updateTag(
    @Param('tagId', ParseUUIDPipe) tagId: string,
    @Body() dto: UpdateEventTagDto,
  ) {
    return this.eventTagsService.update(tagId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('tags/:tagId')
  removeTag(@Param('tagId', ParseUUIDPipe) tagId: string) {
    return this.eventTagsService.remove(tagId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('coverImage'))
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.log(
      `PATCH /events/${id} - update requested (hasCover=${!!file}, removeCoverImage=${dto.removeCoverImage})`,
    );
    return this.eventsService.update(id, dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.eventsService.remove(id);
  }
}
