import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLiveDto } from './dto/create-live.dto';
import { UpdateLiveDto } from './dto/update-live.dto';
import { UpdateChannelSettingsDto } from './dto/update-channel-settings.dto';
import { Live } from './entities/live.entity';
import { LiveChannelSettings } from './entities/live-channel-settings.entity';
import { Event } from '../events/entities/event.entity';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class LivesService {
  private readonly logger = new Logger(LivesService.name);

  constructor(
    @InjectRepository(Live)
    private readonly liveRepo: Repository<Live>,
    @InjectRepository(LiveChannelSettings)
    private readonly settingsRepo: Repository<LiveChannelSettings>,
    @InjectRepository(Event)
    private readonly eventsRepo: Repository<Event>,
    private readonly minioService: MinioService,
  ) {}

  // ---------- Channel settings (singleton) ----------

  async getChannelSettings(): Promise<LiveChannelSettings> {
    const existing = await this.settingsRepo.find({
      order: { createdAt: 'ASC' },
      take: 1,
    });
    if (existing.length > 0) {
      return existing[0];
    }
    const created = this.settingsRepo.create({
      channelName: null,
      channelUrl: null,
    });
    const saved = await this.settingsRepo.save(created);
    this.logger.log(`Live channel settings initialised (id=${saved.id})`);
    return saved;
  }

  async updateChannelSettings(
    dto: UpdateChannelSettingsDto,
  ): Promise<LiveChannelSettings> {
    const current = await this.getChannelSettings();
    if (dto.channelName !== undefined) {
      current.channelName = dto.channelName?.trim() || null;
    }
    if (dto.channelUrl !== undefined) {
      current.channelUrl = dto.channelUrl?.trim() || null;
    }
    const saved = await this.settingsRepo.save(current);
    this.logger.log(`Live channel settings updated (id=${saved.id})`);
    return saved;
  }

  // ---------- Lives ----------

  async create(
    dto: CreateLiveDto,
    file?: Express.Multer.File,
  ): Promise<Live> {
    this.logger.log(
      `Creating live (eventId=${dto.eventId}, startTime=${dto.startTime}, hasCover=${!!file})`,
    );

    const event = await this.resolveEvent(dto.eventId);
    await this.assertNoExistingLiveForEvent(event.id);

    const coverImageUrl = file
      ? await this.minioService.uploadFile(file, 'lives')
      : dto.coverImageUrl;

    const live = this.liveRepo.create({
      event,
      startTime: dto.startTime,
      endTime: dto.endTime ?? null,
      liveUrl: dto.liveUrl,
      replayUrl: dto.replayUrl ?? null,
      coverImageUrl: coverImageUrl ?? null,
    });

    const saved = await this.liveRepo.save(live);
    this.logger.log(`Live created (id=${saved.id})`);
    return this.findOne(saved.id);
  }

  async findAll(filters?: { eventId?: string }): Promise<Live[]> {
    const where = filters?.eventId
      ? { event: { id: filters.eventId } }
      : undefined;

    return this.liveRepo.find({
      where,
      relations: { event: { tournament: true } },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Live> {
    const live = await this.liveRepo.findOne({
      where: { id },
      relations: { event: { tournament: true } },
    });
    if (!live) {
      throw new NotFoundException('Live not found');
    }
    return live;
  }

  async update(
    id: string,
    dto: UpdateLiveDto,
    file?: Express.Multer.File,
  ): Promise<Live> {
    this.logger.log(
      `Updating live (id=${id}, hasCover=${!!file}, removeCoverImage=${dto.removeCoverImage})`,
    );

    const live = await this.findOne(id);
    const shouldRemoveCover = dto.removeCoverImage === 'true';

    if (dto.eventId !== undefined && dto.eventId !== live.event.id) {
      const newEvent = await this.resolveEvent(dto.eventId);
      await this.assertNoExistingLiveForEvent(newEvent.id, live.id);
      live.event = newEvent;
    }
    if (dto.startTime !== undefined) {
      live.startTime = dto.startTime;
    }
    if (dto.endTime !== undefined) {
      live.endTime = dto.endTime ?? null;
    }
    if (dto.liveUrl !== undefined) {
      live.liveUrl = dto.liveUrl;
    }
    if (dto.replayUrl !== undefined) {
      live.replayUrl = dto.replayUrl?.trim() || null;
    }

    if (file) {
      live.coverImageUrl = await this.minioService.uploadFile(file, 'lives');
    } else if (shouldRemoveCover) {
      live.coverImageUrl = null;
    } else if (dto.coverImageUrl !== undefined) {
      live.coverImageUrl = dto.coverImageUrl ?? null;
    }

    const saved = await this.liveRepo.save(live);
    this.logger.log(`Live updated (id=${saved.id})`);
    return this.findOne(saved.id);
  }

  async remove(id: string): Promise<void> {
    const live = await this.findOne(id);
    await this.liveRepo.softRemove(live);
    this.logger.log(`Live removed (id=${id})`);
  }

  private async resolveEvent(eventId: string): Promise<Event> {
    const event = await this.eventsRepo.findOne({ where: { id: eventId } });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  private async assertNoExistingLiveForEvent(
    eventId: string,
    ignoreLiveId?: string,
  ): Promise<void> {
    const existing = await this.liveRepo.findOne({
      where: { event: { id: eventId } },
      relations: { event: true },
    });
    if (existing && existing.id !== ignoreLiveId) {
      throw new ConflictException(
        'Un live existe déjà pour cet évènement',
      );
    }
  }
}
