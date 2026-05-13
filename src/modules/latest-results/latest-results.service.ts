import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLatestResultDto } from './dto/create-latest-result.dto';
import { UpdateLatestResultDto } from './dto/update-latest-result.dto';
import { LatestResult } from './entities/latest-result.entity';
import {
  LATEST_RESULT_CATEGORIES,
  LatestResultCategory,
} from './latest-result-category';

type PaginatedLatestResults = {
  items: LatestResult[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

@Injectable()
export class LatestResultsService {
  constructor(
    @InjectRepository(LatestResult)
    private readonly repo: Repository<LatestResult>,
  ) {}

  async findPaginated(
    page = 1,
    limit = 8,
    category = 'all',
    includeHidden = false,
  ): Promise<PaginatedLatestResults> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const qb = this.repo
      .createQueryBuilder('result')
      .where('result.category IN (:...categories)', {
        categories: [...LATEST_RESULT_CATEGORIES],
      })
      .orderBy(
        'COALESCE(result.endDate, result.startDate, result.resultDate)',
        'DESC',
      )
      .addOrderBy('result.startDate', 'DESC')
      .addOrderBy('result.createdAt', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit);

    if (!includeHidden) {
      qb.andWhere('result.isPublished = true');
    }

    if (this.isCategory(category)) {
      qb.andWhere('result.category = :category', { category });
    }

    const [items, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));

    return {
      items,
      pagination: {
        page: safePage,
        limit: safeLimit,
        totalItems,
        totalPages,
        hasNextPage: safePage < totalPages,
        hasPreviousPage: safePage > 1,
      },
    };
  }

  findAllForAdmin(): Promise<LatestResult[]> {
    return this.repo
      .createQueryBuilder('result')
      .where('result.category IN (:...categories)', {
        categories: [...LATEST_RESULT_CATEGORIES],
      })
      .orderBy(
        'COALESCE(result.endDate, result.startDate, result.resultDate)',
        'DESC',
      )
      .addOrderBy('result.startDate', 'DESC')
      .addOrderBy('result.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<LatestResult> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) {
      throw new NotFoundException('Résultat introuvable');
    }
    return row;
  }

  create(dto: CreateLatestResultDto): Promise<LatestResult> {
    const row = this.repo.create(this.toEntityPayload(dto));
    return this.repo.save(row);
  }

  async update(id: string, dto: UpdateLatestResultDto): Promise<LatestResult> {
    const row = await this.findOne(id);
    Object.assign(row, this.toEntityPayload(dto, row));
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.softRemove(row);
  }

  private toEntityPayload(
    dto: CreateLatestResultDto | UpdateLatestResultDto,
    current?: LatestResult,
  ): Partial<LatestResult> {
    return {
      tournamentName:
        dto.tournamentName !== undefined
          ? dto.tournamentName.trim()
          : current?.tournamentName,
      location:
        dto.location !== undefined ? dto.location?.trim() || null : current?.location,
      startDate: dto.startDate !== undefined ? dto.startDate || null : current?.startDate,
      endDate: dto.endDate !== undefined ? dto.endDate || null : current?.endDate,
      resultDate: dto.resultDate !== undefined ? dto.resultDate : current?.resultDate,
      round: dto.round !== undefined ? dto.round.trim() : current?.round,
      winners: dto.winners !== undefined ? dto.winners.trim() : current?.winners,
      score: dto.score !== undefined ? dto.score.trim() : current?.score,
      losers: dto.losers !== undefined ? dto.losers.trim() : current?.losers,
      category: dto.category ?? current?.category ?? 'men',
      isPublished: dto.isPublished ?? current?.isPublished ?? true,
    };
  }

  private isCategory(value: string): value is LatestResultCategory {
    return LATEST_RESULT_CATEGORIES.includes(value as LatestResultCategory);
  }
}
