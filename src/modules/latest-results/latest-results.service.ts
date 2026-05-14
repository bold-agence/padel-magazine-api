import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLatestResultDto } from './dto/create-latest-result.dto';
import { CreateLatestResultScopeDto } from './dto/create-latest-result-scope.dto';
import { UpdateLatestResultDto } from './dto/update-latest-result.dto';
import { UpdateLatestResultScopeDto } from './dto/update-latest-result-scope.dto';
import { LatestResult } from './entities/latest-result.entity';
import { LatestResultScope } from './entities/latest-result-scope.entity';
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
    @InjectRepository(LatestResultScope)
    private readonly scopesRepo: Repository<LatestResultScope>,
  ) {}

  async findPaginated(
    page = 1,
    limit = 8,
    category = 'all',
    scope = 'all',
    includeHidden = false,
  ): Promise<PaginatedLatestResults> {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(Math.max(1, limit), 50);
    const qb = this.repo
      .createQueryBuilder('result')
      .innerJoinAndSelect('result.scope', 'scope')
      .addSelect(
        'COALESCE(result.endDate, result.startDate, result.resultDate)',
        'sort_date',
      )
      .where('result.category IN (:...categories)', {
        categories: [...LATEST_RESULT_CATEGORIES],
      })
      .orderBy('sort_date', 'DESC')
      .addOrderBy('result.startDate', 'DESC')
      .addOrderBy('result.createdAt', 'DESC')
      .skip((safePage - 1) * safeLimit)
      .take(safeLimit);

    if (!includeHidden) {
      qb.andWhere('result.isPublished = true');
      qb.andWhere('scope.isActive = true');
    }

    if (this.isCategory(category)) {
      qb.andWhere('result.category = :category', { category });
    }

    if (scope !== 'all') {
      qb.andWhere('LOWER(scope.slug) = :scope', {
        scope: scope.trim().toLowerCase(),
      });
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
      .innerJoinAndSelect('result.scope', 'scope')
      .addSelect(
        'COALESCE(result.endDate, result.startDate, result.resultDate)',
        'sort_date',
      )
      .where('result.category IN (:...categories)', {
        categories: [...LATEST_RESULT_CATEGORIES],
      })
      .orderBy('sort_date', 'DESC')
      .addOrderBy('result.startDate', 'DESC')
      .addOrderBy('result.createdAt', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<LatestResult> {
    const row = await this.repo.findOne({
      where: { id },
      relations: { scope: true },
    });
    if (!row) {
      throw new NotFoundException('Résultat introuvable');
    }
    return row;
  }

  async create(dto: CreateLatestResultDto): Promise<LatestResult> {
    const row = this.repo.create(this.toEntityPayload(dto));
    row.scope = await this.resolveScope(dto.scopeId);
    return this.repo.save(row);
  }

  async update(id: string, dto: UpdateLatestResultDto): Promise<LatestResult> {
    const row = await this.findOne(id);
    Object.assign(row, this.toEntityPayload(dto, row));
    if (dto.scopeId !== undefined) {
      row.scope = await this.resolveScope(dto.scopeId);
    }
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const row = await this.findOne(id);
    await this.repo.softRemove(row);
  }

  findActiveScopes(): Promise<LatestResultScope[]> {
    return this.scopesRepo.find({
      where: { isActive: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  findAllScopesForAdmin(): Promise<LatestResultScope[]> {
    return this.scopesRepo.find({
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findOneScope(id: string): Promise<LatestResultScope> {
    const scope = await this.scopesRepo.findOne({ where: { id } });
    if (!scope) {
      throw new NotFoundException('Classement de résultats introuvable');
    }
    return scope;
  }

  async createScope(
    dto: CreateLatestResultScopeDto,
  ): Promise<LatestResultScope> {
    await this.assertUniqueScopeSlug(dto.slug);
    const scope = this.scopesRepo.create(this.toScopePayload(dto));
    return this.scopesRepo.save(scope);
  }

  async updateScope(
    id: string,
    dto: UpdateLatestResultScopeDto,
  ): Promise<LatestResultScope> {
    const scope = await this.findOneScope(id);
    if (dto.slug && dto.slug !== scope.slug) {
      await this.assertUniqueScopeSlug(dto.slug);
    }
    Object.assign(scope, this.toScopePayload(dto, scope));
    return this.scopesRepo.save(scope);
  }

  async removeScope(id: string): Promise<void> {
    const scope = await this.findOneScope(id);
    const resultCount = await this.repo
      .createQueryBuilder('result')
      .innerJoin('result.scope', 'scope')
      .where('scope.id = :id', { id })
      .getCount();

    if (resultCount > 0) {
      throw new ConflictException(
        'Ce classement contient des résultats et ne peut pas être supprimé',
      );
    }

    await this.scopesRepo.delete(scope.id);
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

  private async resolveScope(scopeId?: string): Promise<LatestResultScope> {
    if (scopeId) {
      const scope = await this.scopesRepo.findOne({ where: { id: scopeId } });
      if (!scope) {
        throw new NotFoundException('Classement de résultats introuvable');
      }
      return scope;
    }

    const defaultScope = await this.scopesRepo.findOne({
      where: { slug: 'international' },
    });
    if (!defaultScope) {
      throw new NotFoundException('Classement de résultats par défaut introuvable');
    }
    return defaultScope;
  }

  private async assertUniqueScopeSlug(
    slug: string,
  ): Promise<void> {
    const existing = await this.scopesRepo.findOne({
      where: { slug: slug.trim().toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Ce slug existe déjà');
    }
  }

  private toScopePayload(
    dto: CreateLatestResultScopeDto | UpdateLatestResultScopeDto,
    current?: LatestResultScope,
  ): Partial<LatestResultScope> {
    return {
      name: dto.name !== undefined ? dto.name.trim() : current?.name,
      slug:
        dto.slug !== undefined
          ? dto.slug.trim().toLowerCase()
          : current?.slug,
      displayOrder: dto.displayOrder ?? current?.displayOrder ?? 0,
      isActive: dto.isActive ?? current?.isActive ?? true,
    };
  }
}
