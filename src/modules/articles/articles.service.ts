import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Article } from './entities/article.entity';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { Tag } from './entities/tag.entity';
import { ArticleCategory } from './entities/article-category.entity';
import { Section } from './entities/section.entity';
import { SectionDto } from './dto/section.dto';
import { MinioService } from '../minio/minio.service';

@Injectable()
export class ArticlesService {
  constructor(
    @InjectRepository(Article)
    private readonly articlesRepo: Repository<Article>,
    @InjectRepository(Tag)
    private readonly tagsRepo: Repository<Tag>,
    @InjectRepository(ArticleCategory)
    private readonly categoriesRepo: Repository<ArticleCategory>,
    @InjectRepository(Section)
    private readonly sectionsRepo: Repository<Section>,
    private readonly minioService: MinioService,
  ) {}

  async uploadBannerImage(file: Express.Multer.File): Promise<string> {
    return this.minioService.uploadFile(file, 'articles');
  }

  async create(dto: CreateArticleDto): Promise<Article> {
    const existing = await this.articlesRepo.findOne({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException('Slug already exists');
    }

    const category = await this.resolveCategory(dto.categoryId);
    const tags = await this.resolveTags(dto.tags);
    const sections = this.mapSections(dto.sections);

    const article = this.articlesRepo.create({
      isVisible: dto.isVisible === false ? false : true,
      title: dto.title,
      slug: dto.slug,
      author: dto.author,
      date: new Date(dto.date),
      readingTime: dto.readingTime,
      bannerImage: dto.bannerImage,
      category,
      tags,
      sections,
    });

    return this.articlesRepo.save(article);
  }

  async findAll(): Promise<Article[]> {
    return this.articlesRepo.find({
      where: { isVisible: true },
      relations: {
        sections: true,
        tags: true,
        category: true,
      },
      order: {
        createdAt: 'DESC',
        sections: { order: 'ASC', createdAt: 'ASC' },
      },
    });
  }

  async findOne(id: string): Promise<Article> {
    const article = await this.articlesRepo.findOne({
      where: { id },
      relations: {
        sections: true,
        tags: true,
        category: true,
      },
      order: {
        sections: { order: 'ASC', createdAt: 'ASC' },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return article;
  }

  async update(id: string, dto: UpdateArticleDto): Promise<Article> {
    const article = await this.findOne(id);

    if (dto.slug && dto.slug !== article.slug) {
      const existing = await this.articlesRepo.findOne({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException('Slug already exists');
      }
    }

    if (dto.categoryId !== undefined) {
      article.category = await this.resolveCategory(dto.categoryId);
    }

    if (dto.tags !== undefined) {
      article.tags = await this.resolveTags(dto.tags);
    }

    if (dto.sections !== undefined) {
      if (article.sections.length) {
        await this.sectionsRepo.remove(article.sections);
      }
      article.sections = this.mapSections(dto.sections);
    }

    if (dto.title !== undefined) article.title = dto.title;
    if (dto.isVisible === true) article.isVisible = true;
    if (dto.isVisible === false) article.isVisible = false;
    if (dto.slug !== undefined) article.slug = dto.slug;
    if (dto.author !== undefined) article.author = dto.author;
    if (dto.date !== undefined) article.date = new Date(dto.date);
    if (dto.readingTime !== undefined) article.readingTime = dto.readingTime;
    if (dto.bannerImage !== undefined) article.bannerImage = dto.bannerImage;

    return this.articlesRepo.save(article);
  }

  async remove(id: string): Promise<void> {
    const article = await this.findOne(id);
    await this.articlesRepo.softRemove(article);
  }

  private mapSections(sections?: SectionDto[]): Section[] {
    if (!sections?.length) {
      return [];
    }

    return sections.map((section, index) =>
      this.sectionsRepo.create({
        ...section,
        order: section.order ?? index,
      }),
    );
  }

  private async resolveTags(tags?: string[]): Promise<Tag[]> {
    if (!tags?.length) {
      return [];
    }

    const normalized = [
      ...new Set(tags.map((tag) => tag.trim()).filter(Boolean)),
    ];
    if (!normalized.length) {
      return [];
    }

    const existingTags = await this.tagsRepo.find({
      where: { name: In(normalized) },
    });

    const existingNames = new Set(existingTags.map((tag) => tag.name));
    const missingNames = normalized.filter((name) => !existingNames.has(name));

    const createdTags = missingNames.length
      ? await this.tagsRepo.save(
          missingNames.map((name) => this.tagsRepo.create({ name })),
        )
      : [];

    return [...existingTags, ...createdTags];
  }

  private async resolveCategory(
    categoryId?: string | null,
  ): Promise<ArticleCategory | null> {
    if (categoryId === undefined) {
      return null;
    }

    if (categoryId === null) {
      return null;
    }

    const category = await this.categoriesRepo.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Article category not found');
    }

    return category;
  }
}
