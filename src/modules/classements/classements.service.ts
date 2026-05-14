import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classement } from './entities/classement.entity';
import { ClassementLine } from './entities/classement-line.entity';
import { CreateClassementDto } from './dto/create-classement.dto';
import { UpdateClassementDto } from './dto/update-classement.dto';
import { UpdateClassementPodiumDto } from './dto/update-classement-podium.dto';
import { MinioService } from '../minio/minio.service';
import {
  ClassementLineInput,
  parseClassementExcelBuffer,
} from './classement-excel.parser';

export type ClassementSummary = {
  id: string;
  slug: string;
  title: string;
  pointsNowLabel: string | null;
  pointsPrevLabel: string | null;
  podiumFirstImageUrl: string | null;
  podiumSecondImageUrl: string | null;
  podiumThirdImageUrl: string | null;
  lineCount: number;
  updatedAt: Date;
};

export type ClassementWithLines = Classement & { lines: ClassementLine[] };

@Injectable()
export class ClassementsService {
  private static readonly PODIUM_IMAGE_MIMES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ]);

  constructor(
    @InjectRepository(Classement)
    private readonly classementsRepo: Repository<Classement>,
    @InjectRepository(ClassementLine)
    private readonly linesRepo: Repository<ClassementLine>,
    private readonly minioService: MinioService,
  ) {}

  async findAllSummaries(): Promise<ClassementSummary[]> {
    const classements = await this.classementsRepo.find({
      order: { title: 'ASC' },
    });
    if (!classements.length) return [];

    const counts = await this.linesRepo
      .createQueryBuilder('l')
      .select('l.classementId', 'classementId')
      .addSelect('COUNT(l.id)', 'cnt')
      .where('l.classementId IN (:...ids)', {
        ids: classements.map((c) => c.id),
      })
      .groupBy('l.classementId')
      .getRawMany<{ classementId: string; cnt: string }>();

    const countMap = new Map(
      counts.map((r) => [r.classementId, Number(r.cnt)]),
    );

    return classements.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      pointsNowLabel: c.pointsNowLabel ?? null,
      pointsPrevLabel: c.pointsPrevLabel ?? null,
      podiumFirstImageUrl: c.podiumFirstImageUrl ?? null,
      podiumSecondImageUrl: c.podiumSecondImageUrl ?? null,
      podiumThirdImageUrl: c.podiumThirdImageUrl ?? null,
      lineCount: countMap.get(c.id) ?? 0,
      updatedAt: c.updatedAt,
    }));
  }

  async findOneWithLines(id: string): Promise<ClassementWithLines> {
    const classement = await this.classementsRepo.findOne({
      where: { id },
      relations: { lines: true },
    });
    if (!classement) {
      throw new NotFoundException('Classement introuvable');
    }
    classement.lines.sort((a, b) => a.sortOrder - b.sortOrder);
    return classement as ClassementWithLines;
  }

  async findOneBySlugWithLines(slug: string): Promise<ClassementWithLines> {
    const classement = await this.classementsRepo.findOne({
      where: { slug },
      relations: { lines: true },
    });
    if (!classement) {
      throw new NotFoundException('Classement introuvable');
    }
    classement.lines.sort((a, b) => a.sortOrder - b.sortOrder);
    return classement as ClassementWithLines;
  }

  async create(dto: CreateClassementDto): Promise<Classement> {
    const existing = await this.classementsRepo.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Ce slug est déjà utilisé');
    }
    const entity = this.classementsRepo.create({
      slug: dto.slug.trim().toLowerCase(),
      title: dto.title.trim(),
      pointsNowLabel: dto.pointsNowLabel?.trim() || null,
      pointsPrevLabel: dto.pointsPrevLabel?.trim() || null,
    });
    return this.classementsRepo.save(entity);
  }

  async update(id: string, dto: UpdateClassementDto): Promise<Classement> {
    const classement = await this.classementsRepo.findOne({ where: { id } });
    if (!classement) {
      throw new NotFoundException('Classement introuvable');
    }
    if (dto.slug !== undefined && dto.slug !== classement.slug) {
      const taken = await this.classementsRepo.findOne({
        where: { slug: dto.slug.trim().toLowerCase() },
      });
      if (taken) {
        throw new ConflictException('Ce slug est déjà utilisé');
      }
      classement.slug = dto.slug.trim().toLowerCase();
    }
    if (dto.title !== undefined) {
      classement.title = dto.title.trim();
    }
    if (dto.pointsNowLabel !== undefined) {
      classement.pointsNowLabel = dto.pointsNowLabel?.trim() || null;
    }
    if (dto.pointsPrevLabel !== undefined) {
      classement.pointsPrevLabel = dto.pointsPrevLabel?.trim() || null;
    }
    return this.classementsRepo.save(classement);
  }

  async remove(id: string): Promise<void> {
    const res = await this.classementsRepo.delete({ id });
    if (!res.affected) {
      throw new NotFoundException('Classement introuvable');
    }
  }

  async replaceLinesFromInputs(
    classementId: string,
    inputs: ClassementLineInput[],
  ): Promise<{ imported: number }> {
    const exists = await this.classementsRepo.exist({
      where: { id: classementId },
    });
    if (!exists) {
      throw new NotFoundException('Classement introuvable');
    }

    await this.linesRepo.manager.transaction(async (em) => {
      await em.delete(ClassementLine, { classement: { id: classementId } });
      const batch = inputs.map((row, sortOrder) =>
        em.create(ClassementLine, {
          classement: { id: classementId },
          sortOrder,
          rank: row.rank,
          playerName: row.playerName,
          pointsNow: row.pointsNow,
          tournaments: row.tournaments,
          previousRank: row.previousRank,
          pointsPrev: row.pointsPrev,
          rankDelta: row.rankDelta,
          pointsDelta: row.pointsDelta,
        }),
      );
      await em.save(ClassementLine, batch);
    });

    return { imported: inputs.length };
  }

  async importExcel(classementId: string, buffer: Buffer): Promise<{
    imported: number;
  }> {
    const lines = parseClassementExcelBuffer(buffer);
    return this.replaceLinesFromInputs(classementId, lines);
  }

  async updatePodiumImages(
    id: string,
    files: {
      podiumFirst?: Express.Multer.File[];
      podiumSecond?: Express.Multer.File[];
      podiumThird?: Express.Multer.File[];
    },
    dto: UpdateClassementPodiumDto,
  ): Promise<ClassementWithLines> {
    const classement = await this.classementsRepo.findOne({ where: { id } });
    if (!classement) {
      throw new NotFoundException('Classement introuvable');
    }

    const first = files.podiumFirst?.[0];
    const second = files.podiumSecond?.[0];
    const third = files.podiumThird?.[0];

    if (first) {
      this.assertPodiumImage(first);
      classement.podiumFirstImageUrl = await this.minioService.uploadFile(
        first,
        'classements',
      );
    } else if (dto.removePodiumFirst === 'true') {
      classement.podiumFirstImageUrl = null;
    }

    if (second) {
      this.assertPodiumImage(second);
      classement.podiumSecondImageUrl = await this.minioService.uploadFile(
        second,
        'classements',
      );
    } else if (dto.removePodiumSecond === 'true') {
      classement.podiumSecondImageUrl = null;
    }

    if (third) {
      this.assertPodiumImage(third);
      classement.podiumThirdImageUrl = await this.minioService.uploadFile(
        third,
        'classements',
      );
    } else if (dto.removePodiumThird === 'true') {
      classement.podiumThirdImageUrl = null;
    }

    await this.classementsRepo.save(classement);
    return this.findOneWithLines(id);
  }

  private assertPodiumImage(file: Express.Multer.File): void {
    if (!file.buffer?.length) {
      throw new BadRequestException('Fichier image vide');
    }
    if (!ClassementsService.PODIUM_IMAGE_MIMES.has(file.mimetype)) {
      throw new BadRequestException(
        'Image podium : formats acceptés JPEG, PNG, WebP, GIF.',
      );
    }
  }
}
