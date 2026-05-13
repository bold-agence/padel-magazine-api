import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MinioService } from '../minio/minio.service';
import {
  FIP_RANKING_GENDERS,
  FipRankingGender,
} from './fip-ranking-gender';
import { ReplaceFipRankingDto } from './dto/replace-fip-ranking.dto';
import { FipRanking } from './entities/fip-ranking.entity';
import { FipRankingEntry } from './entities/fip-ranking-entry.entity';

export type FipRankingsPayload = Record<FipRankingGender, FipRanking | null>;

@Injectable()
export class FipRankingsService {
  constructor(
    @InjectRepository(FipRanking)
    private readonly rankingsRepo: Repository<FipRanking>,
    @InjectRepository(FipRankingEntry)
    private readonly entriesRepo: Repository<FipRankingEntry>,
    private readonly minioService: MinioService,
  ) {}

  async findPublishedTop10(): Promise<FipRankingsPayload> {
    const [men, women] = await Promise.all([
      this.findOneForDisplay('men'),
      this.findOneForDisplay('women'),
    ]);
    return { men, women };
  }

  async findAllForAdmin(): Promise<FipRankingsPayload> {
    const [men, women] = await Promise.all([
      this.findOneByGender('men'),
      this.findOneByGender('women'),
    ]);
    return { men, women };
  }

  async replaceByGender(
    genderParam: string,
    dto: ReplaceFipRankingDto,
  ): Promise<FipRanking> {
    const gender = this.normalizeGender(genderParam);
    const entries = dto.entries ?? [];
    const isPublished = dto.isPublished ?? true;

    if (entries.length > 10) {
      throw new BadRequestException('Le Top 10 ne peut pas dépasser 10 lignes');
    }
    if (isPublished && entries.length !== 10) {
      throw new BadRequestException(
        'Un classement publié doit contenir exactement 10 lignes',
      );
    }

    await this.rankingsRepo.manager.transaction(async (em) => {
      let ranking = await em.findOne(FipRanking, { where: { gender } });
      if (!ranking) {
        ranking = em.create(FipRanking, { gender });
      }

      ranking.title = dto.title.trim();
      ranking.rankingDate = dto.rankingDate || null;
      ranking.sourceUrl = dto.sourceUrl?.trim() || null;
      ranking.isPublished = isPublished;
      ranking = await em.save(FipRanking, ranking);

      await em
        .createQueryBuilder()
        .delete()
        .from(FipRankingEntry)
        .where('"rankingId" = :rankingId', { rankingId: ranking.id })
        .execute();

      const batch = entries.map((entry, index) =>
        em.create(FipRankingEntry, {
          ranking: { id: ranking.id },
          sortOrder: entry.sortOrder ?? index,
          rank: entry.rank,
          playerName: entry.playerName.trim(),
          countryCode: entry.countryCode?.trim().toUpperCase() || null,
          points: entry.points,
          playerImageUrl: entry.playerImageUrl?.trim() || null,
        }),
      );
      if (batch.length) {
        await em.save(FipRankingEntry, batch);
      }
    });

    return this.findOneByGenderOrThrow(gender);
  }

  async uploadPlayerImage(file: Express.Multer.File): Promise<string> {
    if (!file.mimetype?.startsWith('image/')) {
      throw new BadRequestException('Le fichier doit être une image');
    }
    return this.minioService.uploadFile(file, 'fip-rankings');
  }

  private async findOneForDisplay(
    gender: FipRankingGender,
  ): Promise<FipRanking | null> {
    const ranking = await this.rankingsRepo.findOne({
      where: { gender, isPublished: true },
      relations: { entries: true },
    });
    if (!ranking?.entries?.length) {
      return null;
    }
    this.sortEntries(ranking);
    return ranking;
  }

  private async findOneByGender(
    gender: FipRankingGender,
  ): Promise<FipRanking | null> {
    const ranking = await this.rankingsRepo.findOne({
      where: { gender },
      relations: { entries: true },
    });
    if (ranking) {
      this.sortEntries(ranking);
    }
    return ranking;
  }

  private async findOneByGenderOrThrow(
    gender: FipRankingGender,
  ): Promise<FipRanking> {
    const ranking = await this.findOneByGender(gender);
    if (!ranking) {
      throw new BadRequestException('Classement FIP introuvable');
    }
    return ranking;
  }

  private normalizeGender(value: string): FipRankingGender {
    if (FIP_RANKING_GENDERS.includes(value as FipRankingGender)) {
      return value as FipRankingGender;
    }
    throw new BadRequestException('Genre de classement invalide');
  }

  private sortEntries(ranking: FipRanking): void {
    ranking.entries.sort((a, b) => a.sortOrder - b.sortOrder);
  }
}
