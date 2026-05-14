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

    const categories = await this.resolveCategories(
      dto.categoryIds,
      dto.categoryId,
    );
    const category = categories[0] ?? null;
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
      categories,
      tags,
      sections,
    });

    return this.hydratePrimaryCategory(await this.articlesRepo.save(article));
  }

  async findAll(): Promise<Article[]> {
    const articles = await this.articlesRepo.find({
      where: { isVisible: true },
      relations: {
        sections: true,
        tags: true,
        category: true,
        categories: true,
      },
      order: {
        createdAt: 'DESC',
        sections: { order: 'ASC', createdAt: 'ASC' },
      },
    });
    return this.hydratePrimaryCategories(articles);
  }

  async findPaginated(
    page = 1,
    limit = 9,
    category = 'all',
    includeHidden = false,
    onlyHidden = false,
    q?: string,
  ): Promise<{
    items: Article[];
    pagination: {
      page: number;
      limit: number;
      totalItems: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  }> {
    const safePage = Number.isFinite(page) && page > 0 ? page : 1;
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : 9;
    const normalizedCategory = category?.trim().toLowerCase() || 'all';
    let effectiveCategory = normalizedCategory;
    if (normalizedCategory !== 'all') {
      const existingCategory = await this.categoriesRepo
        .createQueryBuilder('category')
        .where('LOWER(category.slug) = :slug', { slug: normalizedCategory })
        .getOne();
      if (!existingCategory) {
        effectiveCategory = 'all';
      }
    }

    const baseQuery = this.articlesRepo
      .createQueryBuilder('article')
      .leftJoin('article.category', 'primaryCategory')
      .leftJoin('article.categories', 'filterCategory')
      .distinct(true);

    if (onlyHidden) {
      baseQuery.where('article.isVisible = :articleIsVisible', {
        articleIsVisible: false,
      });
    } else if (!includeHidden) {
      baseQuery.where('article.isVisible = :articleIsVisible', {
        articleIsVisible: true,
      });
    }

    if (effectiveCategory !== 'all') {
      baseQuery.andWhere(
        '(LOWER(primaryCategory.slug) = :categorySlug OR LOWER(filterCategory.slug) = :categorySlug)',
        { categorySlug: effectiveCategory },
      );
    }

    const searchTerm = typeof q === 'string' ? q.trim() : '';
    if (searchTerm.length > 0) {
      baseQuery.andWhere(
        '(LOWER(article.title) LIKE :search OR LOWER(article.slug) LIKE :search OR LOWER(article.author) LIKE :search)',
        { search: `%${searchTerm.toLowerCase()}%` },
      );
    }

    const totalItems = await baseQuery.getCount();

    const pagedRows = await baseQuery
      .clone()
      .select('article.id', 'id')
      .addSelect('article.createdAt', 'createdAt')
      .orderBy('article.createdAt', 'DESC')
      .addOrderBy('article.id', 'DESC')
      .offset((safePage - 1) * safeLimit)
      .limit(safeLimit)
      .getRawMany<{ id: string }>();

    const idOrder = pagedRows.map((row) => row.id);
    let items: Article[] = [];
    if (idOrder.length) {
      const loaded = await this.articlesRepo.find({
        where: { id: In(idOrder) },
        relations: {
          sections: true,
          tags: true,
          category: true,
          categories: true,
        },
        order: {
          createdAt: 'DESC',
          sections: { order: 'ASC', createdAt: 'ASC' },
        },
      });

      const byId = new Map(loaded.map((article) => [article.id, article]));
      items = idOrder
        .map((id) => byId.get(id))
        .filter((article): article is Article => Boolean(article));
      items = this.hydratePrimaryCategories(items);
    }

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

  async findOne(id: string): Promise<Article> {
    const article = await this.articlesRepo.findOne({
      where: { id },
      relations: {
        sections: true,
        tags: true,
        category: true,
        categories: true,
      },
      order: {
        sections: { order: 'ASC', createdAt: 'ASC' },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.hydratePrimaryCategory(article);
  }

  async findBySlug(slug: string): Promise<Article> {
    const article = await this.articlesRepo.findOne({
      where: { slug },
      relations: {
        sections: true,
        tags: true,
        category: true,
        categories: true,
      },
      order: {
        sections: { order: 'ASC', createdAt: 'ASC' },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    return this.hydratePrimaryCategory(article);
  }

  async trackViewBySlug(slug: string): Promise<void> {
    const article = await this.articlesRepo.findOne({
      where: { slug, isVisible: true },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    await this.articlesRepo.increment({ id: article.id }, 'viewCount', 1);
    await this.articlesRepo.update(article.id, { lastViewedAt: new Date() });
  }

  async findRelatedBySlug(slug: string, limit = 3): Promise<Article[]> {
    const currentArticle = await this.articlesRepo.findOne({
      where: { slug, isVisible: true },
      relations: { category: true, categories: true },
    });

    if (!currentArticle) {
      throw new NotFoundException('Article not found');
    }

    const currentCategoryIds = this.getArticleCategoryIds(currentArticle);

    const query = this.articlesRepo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.tags', 'tags')
      .leftJoinAndSelect('article.category', 'primaryCategory')
      .leftJoinAndSelect('article.categories', 'relatedCategories')
      .where('article.isVisible = :visible', { visible: true })
      .andWhere('article.id != :currentId', { currentId: currentArticle.id })
      .orderBy('article.createdAt', 'DESC')
      .distinct(true)
      .take(limit);

    if (currentCategoryIds.length) {
      query.andWhere(
        '(primaryCategory.id IN (:...categoryIds) OR relatedCategories.id IN (:...categoryIds))',
        { categoryIds: currentCategoryIds },
      );
    }

    const related = this.hydratePrimaryCategories(await query.getMany());
    if (related.length >= limit || !currentCategoryIds.length) {
      return related;
    }

    const missing = limit - related.length;
    const fallbackQuery = this.articlesRepo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.tags', 'tags')
      .leftJoinAndSelect('article.category', 'primaryCategory')
      .leftJoinAndSelect('article.categories', 'relatedCategories')
      .where('article.isVisible = :visible', { visible: true })
      .andWhere('article.id != :currentId', { currentId: currentArticle.id })
      .orderBy('article.createdAt', 'DESC')
      .take(missing);

    if (related.length) {
      fallbackQuery.andWhere('article.id NOT IN (:...relatedIds)', {
        relatedIds: related.map((article) => article.id),
      });
    }

    const fallback = await fallbackQuery.getMany();

    return [...related, ...this.hydratePrimaryCategories(fallback)];
  }

  async findPopular(
    limit = 5,
    category = 'all',
    excludeSlug?: string,
    mode: string = 'popular',
  ): Promise<Article[]> {
    const safeLimit =
      Number.isFinite(limit) && limit > 0 ? Math.min(limit, 20) : 5;
    const normalizedCategory = category?.trim().toLowerCase() || 'all';
    const normalizedMode = (mode ?? 'popular').trim().toLowerCase();

    const query = this.articlesRepo
      .createQueryBuilder('article')
      .leftJoinAndSelect('article.category', 'primaryCategory')
      .leftJoinAndSelect('article.categories', 'filterCategories')
      .where('article.isVisible = :visible', { visible: true })
      .distinct(true)
      .orderBy(
        normalizedMode === 'trending' ? 'article.date' : 'article.viewCount',
        'DESC',
      )
      .addOrderBy('article.lastViewedAt', 'DESC')
      .addOrderBy('article.createdAt', 'DESC')
      .addOrderBy('article.id', 'DESC')
      .take(safeLimit);

    if (excludeSlug?.trim()) {
      query.andWhere('article.slug != :excludeSlug', {
        excludeSlug: excludeSlug.trim(),
      });
    }

    if (normalizedCategory !== 'all') {
      const categoryExists = await this.categoriesRepo
        .createQueryBuilder('category')
        .where('LOWER(category.slug) = :slug', { slug: normalizedCategory })
        .getOne();
      if (categoryExists) {
        query.andWhere(
          '(LOWER(primaryCategory.slug) = :slug OR LOWER(filterCategories.slug) = :slug)',
          { slug: normalizedCategory },
        );
      }
    }

    return this.hydratePrimaryCategories(await query.getMany());
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

    if (dto.categoryIds !== undefined || dto.categoryId !== undefined) {
      const categories = await this.resolveCategories(
        dto.categoryIds,
        dto.categoryId,
      );
      article.categories = categories;
      article.category = categories[0] ?? null;
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

    return this.hydratePrimaryCategory(await this.articlesRepo.save(article));
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

  private async resolveCategories(
    categoryIds?: string[],
    legacyCategoryId?: string | null,
  ): Promise<ArticleCategory[]> {
    const idsSource =
      categoryIds !== undefined
        ? categoryIds
        : legacyCategoryId
          ? [legacyCategoryId]
          : [];
    const ids = [...new Set(idsSource.map((id) => id.trim()).filter(Boolean))];

    if (!ids.length) {
      return [];
    }

    const categories = await this.categoriesRepo.find({
      where: { id: In(ids) },
    });

    if (categories.length !== ids.length) {
      throw new NotFoundException('Article category not found');
    }

    const byId = new Map(categories.map((category) => [category.id, category]));
    return ids
      .map((id) => byId.get(id))
      .filter((category): category is ArticleCategory => Boolean(category));
  }

  private hydratePrimaryCategory(article: Article): Article {
    article.categories = article.categories ?? [];
    article.category = article.category ?? article.categories[0] ?? null;
    return article;
  }

  private hydratePrimaryCategories(articles: Article[]): Article[] {
    return articles.map((article) => this.hydratePrimaryCategory(article));
  }

  private getArticleCategoryIds(article: Article): string[] {
    return [
      ...new Set([
        article.category?.id,
        ...(article.categories ?? []).map((category) => category.id),
      ].filter((id): id is string => Boolean(id))),
    ];
  }
}
