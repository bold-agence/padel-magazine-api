import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { Article } from './entities/article.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionsRepo: Repository<Section>,
    @InjectRepository(Article)
    private readonly articlesRepo: Repository<Article>,
  ) {}

  async create(dto: CreateSectionDto): Promise<Section> {
    const article = await this.resolveArticle(dto.articleId);
    const section = this.sectionsRepo.create({
      type: dto.type,
      order: dto.order ?? 0,
      content: dto.content,
      headingLevel: dto.headingLevel,
      imageUrl: dto.imageUrl,
      imageCaption: dto.imageCaption,
      quoteAuthor: dto.quoteAuthor,
      spacerHeight: dto.spacerHeight,
      data: dto.data,
      article,
    });
    return this.sectionsRepo.save(section);
  }

  async findAll(): Promise<Section[]> {
    return this.sectionsRepo.find({
      relations: { article: true },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Section> {
    const section = await this.sectionsRepo.findOne({
      where: { id },
      relations: { article: true },
    });
    if (!section) {
      throw new NotFoundException('Section not found');
    }
    return section;
  }

  async update(id: string, dto: UpdateSectionDto): Promise<Section> {
    const section = await this.findOne(id);

    if (dto.articleId !== undefined) {
      section.article = await this.resolveArticle(dto.articleId);
    }

    if (dto.type !== undefined) section.type = dto.type;
    if (dto.order !== undefined) section.order = dto.order;
    if (dto.content !== undefined) section.content = dto.content;
    if (dto.headingLevel !== undefined) section.headingLevel = dto.headingLevel;
    if (dto.imageUrl !== undefined) section.imageUrl = dto.imageUrl;
    if (dto.imageCaption !== undefined) section.imageCaption = dto.imageCaption;
    if (dto.quoteAuthor !== undefined) section.quoteAuthor = dto.quoteAuthor;
    if (dto.spacerHeight !== undefined) section.spacerHeight = dto.spacerHeight;
    if (dto.data !== undefined) section.data = dto.data;

    return this.sectionsRepo.save(section);
  }

  async remove(id: string): Promise<void> {
    const section = await this.findOne(id);
    await this.sectionsRepo.softRemove(section);
  }

  private async resolveArticle(articleId: string): Promise<Article> {
    const article = await this.articlesRepo.findOne({ where: { id: articleId } });
    if (!article) {
      throw new NotFoundException('Article not found');
    }
    return article;
  }
}
