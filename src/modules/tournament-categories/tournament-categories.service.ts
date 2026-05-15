import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { TournamentCategory } from './entities/tournament-category.entity';
import { CreateTournamentCategoryDto } from './dto/create-tournament-category.dto';
import { UpdateTournamentCategoryDto } from './dto/update-tournament-category.dto';

@Injectable()
export class TournamentCategoriesService {
  private readonly logger = new Logger(TournamentCategoriesService.name);

  constructor(
    @InjectRepository(TournamentCategory)
    private readonly categoryRepo: Repository<TournamentCategory>,
    @InjectRepository(Tournament)
    private readonly tournamentRepo: Repository<Tournament>,
  ) {}

  async create(dto: CreateTournamentCategoryDto): Promise<TournamentCategory> {
    await this.assertTournamentExists(dto.tournamentId);
    await this.assertSlugFree(dto.tournamentId, dto.slug);

    const row = this.categoryRepo.create({
      label: dto.label.trim(),
      slug: dto.slug.trim(),
      description: dto.description ?? null,
      tournament: { id: dto.tournamentId },
    });
    const saved = await this.categoryRepo.save(row);
    this.logger.log(
      `Tournament category created (id=${saved.id}, tournamentId=${dto.tournamentId}, slug=${saved.slug})`,
    );
    return this.findOne(saved.id);
  }

  async findAll(filters?: {
    tournamentId?: string;
  }): Promise<TournamentCategory[]> {
    if (filters?.tournamentId) {
      const uuidRe =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRe.test(filters.tournamentId)) {
        throw new BadRequestException('Invalid tournamentId query parameter');
      }
    }

    const qb = this.categoryRepo
      .createQueryBuilder('c')
      .innerJoinAndSelect('c.tournament', 't')
      .where('t.deletedAt IS NULL')
      .orderBy('c.createdAt', 'DESC');

    if (filters?.tournamentId) {
      qb.andWhere('c.tournamentId = :tid', { tid: filters.tournamentId });
    }

    return qb.getMany();
  }

  async findOne(id: string): Promise<TournamentCategory> {
    const row = await this.categoryRepo.findOne({
      where: { id },
      relations: ['tournament'],
    });
    if (!row) {
      throw new NotFoundException('Tournament category not found');
    }
    if (!row.tournament || row.tournament.deletedAt) {
      throw new NotFoundException('Tournament category not found');
    }
    return row;
  }

  async update(
    id: string,
    dto: UpdateTournamentCategoryDto,
  ): Promise<TournamentCategory> {
    const category = await this.findOne(id);
    const nextTournamentId = dto.tournamentId ?? category.tournament.id;
    if (dto.tournamentId) {
      await this.assertTournamentExists(dto.tournamentId);
    }

    const nextSlug = dto.slug !== undefined ? dto.slug.trim() : category.slug;
    if (
      nextTournamentId !== category.tournament.id ||
      nextSlug !== category.slug
    ) {
      await this.assertSlugFree(nextTournamentId, nextSlug, id);
    }

    if (dto.label !== undefined) {
      category.label = dto.label.trim();
    }
    if (dto.slug !== undefined) {
      category.slug = dto.slug.trim();
    }
    if (dto.description !== undefined) {
      category.description = dto.description ?? null;
    }
    if (dto.tournamentId !== undefined) {
      category.tournament = { id: dto.tournamentId } as Tournament;
    }

    const saved = await this.categoryRepo.save(category);
    this.logger.log(`Tournament category updated (id=${saved.id})`);
    return this.findOne(saved.id);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.categoryRepo.softRemove(category);
    this.logger.log(`Tournament category removed (id=${id})`);
  }

  private async assertTournamentExists(tournamentId: string): Promise<void> {
    const t = await this.tournamentRepo.findOne({ where: { id: tournamentId } });
    if (!t) {
      throw new NotFoundException('Tournament not found');
    }
  }

  /** Slug unique par tournoi (insensible à la casse), hors lignes supprimées. */
  private async assertSlugFree(
    tournamentId: string,
    slug: string,
    excludeCategoryId?: string,
  ): Promise<void> {
    const qb = this.categoryRepo
      .createQueryBuilder('c')
      .where('c.tournamentId = :tid', { tid: tournamentId })
      .andWhere('LOWER(c.slug) = LOWER(:slug)', { slug: slug.trim() });
    if (excludeCategoryId) {
      qb.andWhere('c.id != :cid', { cid: excludeCategoryId });
    }
    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException(
        'Category slug already exists for this tournament',
      );
    }
  }
}
