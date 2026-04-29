import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { Article } from '../modules/articles/entities/article.entity';
import { ArticleCategory } from '../modules/articles/entities/article-category.entity';
import { Tag } from '../modules/articles/entities/tag.entity';
import { Section, SectionType } from '../modules/articles/entities/section.entity';

const DEFAULT_ARTICLES_PER_CATEGORY = 10;

function getArticlesPerCategory(): number {
  const raw = process.env.SEED_ARTICLES_PER_CATEGORY;
  if (!raw) {
    return DEFAULT_ARTICLES_PER_CATEGORY;
  }
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_ARTICLES_PER_CATEGORY;
  }
  return Math.min(parsed, 50);
}

function toTitleCase(value: string): string {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

async function getOrCreateTag(
  dataSource: DataSource,
  name: string,
): Promise<Tag> {
  const tagRepo = dataSource.getRepository(Tag);
  const existing = await tagRepo.findOne({ where: { name } });
  if (existing) {
    return existing;
  }
  return tagRepo.save(tagRepo.create({ name }));
}

async function bootstrap() {
  const articlesPerCategory = getArticlesPerCategory();
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);
    const categoryRepo = dataSource.getRepository(ArticleCategory);
    const articleRepo = dataSource.getRepository(Article);

    const categories = await categoryRepo.find({ order: { name: 'ASC' } });
    if (!categories.length) {
      console.log('Aucune catégorie trouvée. Seed annulé.');
      return;
    }

    const globalTags = ['Padel', 'Magazine', 'Actu'];
    const tagEntities = await Promise.all(
      globalTags.map((tag) => getOrCreateTag(dataSource, tag)),
    );

    let createdCount = 0;
    let skippedCount = 0;

    for (const category of categories) {
      const categoryName = category.name || toTitleCase(category.slug);
      const categoryTags = await Promise.all([
        getOrCreateTag(dataSource, categoryName),
        getOrCreateTag(dataSource, `${categoryName} News`),
      ]);

      for (let index = 1; index <= articlesPerCategory; index += 1) {
        const slug = `seed-${category.slug}-${index}`;
        const existingArticle = await articleRepo.findOne({ where: { slug } });
        if (existingArticle) {
          skippedCount += 1;
          continue;
        }

        const title = `${categoryName} - Article démo ${index}`;
        const date = new Date();
        date.setDate(date.getDate() - (index - 1));

        const sections = [
          dataSource.getRepository(Section).create({
            type: SectionType.HEADING,
            order: 0,
            content: `${title} : points clés`,
            headingLevel: 2,
          }),
          dataSource.getRepository(Section).create({
            type: SectionType.PARAGRAPH,
            order: 1,
            content:
              'Cet article est généré automatiquement pour peupler la catégorie et tester la pagination.',
          }),
          dataSource.getRepository(Section).create({
            type: SectionType.INFO_BOX,
            order: 2,
            infoBoxTitle: 'Info',
            content:
              'Ce contenu est un seed technique. Il peut être modifié ou supprimé depuis le backoffice.',
          }),
        ];

        const article = articleRepo.create({
          isVisible: true,
          title,
          slug,
          author: 'BOLD Padel Bot',
          date,
          readingTime: `${4 + index} min`,
          category,
          tags: [...tagEntities, ...categoryTags],
          sections,
        });

        await articleRepo.save(article);
        createdCount += 1;
      }
    }

    console.log(
      `Seed terminé (${articlesPerCategory} articles/catégorie). Créés: ${createdCount}, ignorés (déjà existants): ${skippedCount}.`,
    );
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: unknown) => {
  console.error('Erreur pendant le seed des articles:', error);
  process.exitCode = 1;
});
