import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
    @InjectRepository(Tournament)
    private readonly tournamentsRepo: Repository<Tournament>,
    private readonly minioService: MinioService,
  ) {}

  async create(
    dto: CreateEventDto,
    file?: Express.Multer.File,
  ): Promise<Event> {
    this.logger.log(
      `Creating event (title=${dto.title}, slug=${dto.slug}, hasCover=${!!file}, tournamentId=${dto.tournamentId ?? 'none'})`,
    );

    const existing = await this.repo.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException('Event slug already exists');
    }

    const tournament = await this.resolveTournament(dto.tournamentId);
    const coverImageUrl = file
      ? await this.minioService.uploadFile(file, 'events')
      : dto.coverImageUrl;

    const event = this.repo.create({
      title: dto.title,
      slug: dto.slug,
      startAt: this.parseDate(dto.startAt, 'startAt'),
      endAt: dto.endAt ? this.parseDate(dto.endAt, 'endAt') : null,
      venue: dto.venue,
      descriptionHtml: dto.descriptionHtml ?? null,
      coverImageUrl: coverImageUrl ?? null,
      tournament,
    });

    this.assertEndAfterStart(event.startAt, event.endAt);

    const saved = await this.repo.save(event);
    this.logger.log(`Event created (id=${saved.id})`);
    return this.findOne(saved.id);
  }

  async findAll(filters?: { tournamentId?: string }): Promise<Event[]> {
    const where = filters?.tournamentId
      ? { tournament: { id: filters.tournamentId } }
      : undefined;

    return this.repo.find({
      where,
      relations: { tournament: true },
      order: { startAt: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Event> {
    const event = await this.repo.findOne({
      where: { id },
      relations: { tournament: true },
    });
    if (!event) {
      throw new NotFoundException('Event not found');
    }
    return event;
  }

  async update(
    id: string,
    dto: UpdateEventDto,
    file?: Express.Multer.File,
  ): Promise<Event> {
    this.logger.log(
      `Updating event (id=${id}, hasCover=${!!file}, removeCoverImage=${dto.removeCoverImage})`,
    );

    const event = await this.findOne(id);
    const shouldRemoveCover = dto.removeCoverImage === 'true';

    if (dto.slug !== undefined && dto.slug !== event.slug) {
      const existing = await this.repo.findOne({ where: { slug: dto.slug } });
      if (existing && existing.id !== event.id) {
        throw new ConflictException('Event slug already exists');
      }
      event.slug = dto.slug;
    }
    if (dto.title !== undefined) {
      event.title = dto.title;
    }
    if (dto.startAt !== undefined) {
      event.startAt = this.parseDate(dto.startAt, 'startAt');
    }
    if (dto.endAt !== undefined) {
      event.endAt = dto.endAt ? this.parseDate(dto.endAt, 'endAt') : null;
    }
    if (dto.venue !== undefined) {
      event.venue = dto.venue;
    }
    if (dto.descriptionHtml !== undefined) {
      event.descriptionHtml = dto.descriptionHtml ?? null;
    }
    if (dto.tournamentId !== undefined) {
      event.tournament = await this.resolveTournament(dto.tournamentId);
    }

    if (file) {
      event.coverImageUrl = await this.minioService.uploadFile(file, 'events');
    } else if (shouldRemoveCover) {
      event.coverImageUrl = null;
    } else if (dto.coverImageUrl !== undefined) {
      event.coverImageUrl = dto.coverImageUrl ?? null;
    }

    this.assertEndAfterStart(event.startAt, event.endAt);

    const saved = await this.repo.save(event);
    this.logger.log(`Event updated (id=${saved.id})`);
    return this.findOne(saved.id);
  }

  async remove(id: string): Promise<void> {
    const event = await this.findOne(id);
    await this.repo.softRemove(event);
    this.logger.log(`Event removed (id=${id})`);
  }

  private async resolveTournament(
    tournamentId?: string | null,
  ): Promise<Tournament | null> {
    if (!tournamentId) {
      return null;
    }

    const tournament = await this.tournamentsRepo.findOne({
      where: { id: tournamentId },
    });
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
    return tournament;
  }

  private parseDate(value: string, field: string): Date {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException(`${field} must be a valid date`);
    }
    return date;
  }

  private assertEndAfterStart(startAt: Date, endAt?: Date | null): void {
    if (endAt && endAt.getTime() < startAt.getTime()) {
      throw new BadRequestException('endAt must be after startAt');
    }
  }
}
