import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portrait } from './entities/portrait.entity';
import { PortraitCategory } from './entities/portrait-category.entity';
import { Player } from '../players/entities/player.entity';
import { Article } from '../articles/entities/article.entity';
import { CreatePortraitDto } from './dto/create-portrait.dto';
import { UpdatePortraitDto } from './dto/update-portrait.dto';

@Injectable()
export class PortraitsService {
  constructor(
    @InjectRepository(Portrait)
    private readonly portraitsRepo: Repository<Portrait>,
    @InjectRepository(PortraitCategory)
    private readonly categoriesRepo: Repository<PortraitCategory>,
    @InjectRepository(Player)
    private readonly playersRepo: Repository<Player>,
    @InjectRepository(Article)
    private readonly articlesRepo: Repository<Article>,
  ) {}

  async create(dto: CreatePortraitDto): Promise<Portrait> {
    const player = await this.playersRepo.findOne({
      where: { id: dto.playerId },
      relations: { portrait: true },
    });
    if (!player) {
      throw new NotFoundException('Player not found');
    }
    if (player.portrait) {
      throw new ConflictException('Player already has a portrait');
    }

    const category = await this.categoriesRepo.findOne({
      where: { id: dto.categoryId },
    });
    if (!category) {
      throw new NotFoundException('Portrait category not found');
    }

    const article = await this.resolvePortraitArticle(dto.articleId);

    const portrait = this.portraitsRepo.create({
      indice: dto.indice,
      pointNumber: dto.pointNumber,
      signature: dto.signature ?? null,
      player,
      category,
      article,
    });
    return this.portraitsRepo.save(portrait);
  }

  async findAll(): Promise<Portrait[]> {
    return this.portraitsRepo.find({
      relations: { player: { club: true }, category: true, article: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Portrait> {
    const portrait = await this.portraitsRepo.findOne({
      where: { id },
      relations: { player: { club: true }, category: true, article: true },
    });
    if (!portrait) {
      throw new NotFoundException('Portrait not found');
    }
    return portrait;
  }

  async update(id: string, dto: UpdatePortraitDto): Promise<Portrait> {
    const portrait = await this.findOne(id);

    if (dto.playerId && dto.playerId !== portrait.player?.id) {
      const player = await this.playersRepo.findOne({
        where: { id: dto.playerId },
        relations: { portrait: true },
      });
      if (!player) throw new NotFoundException('Player not found');
      if (player.portrait && player.portrait.id !== portrait.id) {
        throw new ConflictException('Player already has a portrait');
      }
      portrait.player = player;
    }

    if (dto.categoryId && dto.categoryId !== portrait.category?.id) {
      const category = await this.categoriesRepo.findOne({
        where: { id: dto.categoryId },
      });
      if (!category) throw new NotFoundException('Portrait category not found');
      portrait.category = category;
    }

    if (dto.articleId !== undefined) {
      portrait.article = await this.resolvePortraitArticle(dto.articleId, portrait.id);
    }

    if (dto.indice !== undefined) portrait.indice = dto.indice;
    if (dto.pointNumber !== undefined) portrait.pointNumber = dto.pointNumber;
    if (dto.signature !== undefined) portrait.signature = dto.signature;

    return this.portraitsRepo.save(portrait);
  }

  async remove(id: string): Promise<void> {
    const portrait = await this.findOne(id);
    await this.portraitsRepo.softRemove(portrait);
  }

  private async resolvePortraitArticle(
    articleId?: string | null,
    currentPortraitId?: string,
  ): Promise<Article | null> {
    if (articleId === undefined) {
      return null;
    }
    if (articleId === null) {
      return null;
    }

    const article = await this.articlesRepo.findOne({ where: { id: articleId } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    if (article.isVisible !== false) {
      throw new ConflictException('Portrait article must be invisible (isVisible=false)');
    }

    const existing = await this.portraitsRepo
      .createQueryBuilder('portrait')
      .leftJoin('portrait.article', 'article')
      .where('article.id = :articleId', { articleId })
      .getOne();

    if (existing && existing.id !== currentPortraitId) {
      throw new ConflictException('Article already linked to a portrait');
    }

    return article;
  }
}

