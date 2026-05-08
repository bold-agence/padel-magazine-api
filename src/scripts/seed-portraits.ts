import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';
import { Club } from '../modules/clubs/entities/club.entity';
import { Player } from '../modules/players/entities/player.entity';
import { PortraitCategory } from '../modules/portraits/entities/portrait-category.entity';
import { Portrait } from '../modules/portraits/entities/portrait.entity';
import { Article } from '../modules/articles/entities/article.entity';
import { ArticleCategory } from '../modules/articles/entities/article-category.entity';
import { Section, SectionType } from '../modules/articles/entities/section.entity';

const DEFAULT_COUNT = 12;

function getCount(): number {
  const raw = process.env.SEED_PORTRAITS_COUNT;
  if (!raw) return DEFAULT_COUNT;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_COUNT;
  return Math.min(parsed, 50);
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function bootstrap() {
  const count = getCount();
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const dataSource = app.get(DataSource);
    const clubsRepo = dataSource.getRepository(Club);
    const playersRepo = dataSource.getRepository(Player);
    const categoriesRepo = dataSource.getRepository(PortraitCategory);
    const portraitsRepo = dataSource.getRepository(Portrait);
    const articlesRepo = dataSource.getRepository(Article);
    const articleCategoriesRepo = dataSource.getRepository(ArticleCategory);
    const sectionsRepo = dataSource.getRepository(Section);

    // 1) Clubs
    const clubSeeds = [
      { title: 'FS Padel', description: 'Club seed (FS Padel)' },
      { title: 'Almadies Padel', description: 'Club seed (Almadies)' },
      { title: 'Dakar Padel Center', description: 'Club seed (DPC)' },
      { title: 'Yoff Padel', description: 'Club seed (Yoff)' },
    ];

    const clubs: Club[] = [];
    for (const seed of clubSeeds) {
      let club = await clubsRepo.findOne({ where: { title: seed.title } });
      if (!club) {
        club = await clubsRepo.save(clubsRepo.create(seed));
      }
      clubs.push(club);
    }

    // 2) Portrait categories (4)
    const categoryLabels = [
      'Champion',
      'Espoir',
      'International',
      'Légende',
    ];
    const portraitCategories: PortraitCategory[] = [];
    for (const libelle of categoryLabels) {
      let category = await categoriesRepo.findOne({ where: { libelle } });
      if (!category) {
        category = await categoriesRepo.save(categoriesRepo.create({ libelle }));
      }
      portraitCategories.push(category);
    }

    // 3) Article category for portrait articles (optional)
    let portraitsArticleCategory = await articleCategoriesRepo.findOne({
      where: { slug: 'portraits' },
    });
    if (!portraitsArticleCategory) {
      portraitsArticleCategory = await articleCategoriesRepo.save(
        articleCategoriesRepo.create({
          name: 'Portraits',
          slug: 'portraits',
          color: '#7c3aed',
        }),
      );
    }

    // 4) Players + Portraits + (optional) invisible article
    const linkCount = Math.floor((count * 3) / 4); // 3/4 of portraits linked
    let createdPlayers = 0;
    let createdPortraits = 0;
    let createdInvisibleArticles = 0;

    for (let i = 1; i <= count; i += 1) {
      const playerName = `Joueur Portrait ${i}`;
      const slug = `seed-portrait-player-${slugify(playerName)}`;

      let player = await playersRepo.findOne({
        where: { slug },
        relations: { portrait: true, club: true },
      });
      if (!player) {
        const createdPlayer = playersRepo.create({
          slug,
          name: playerName,
          nationality: 'Sénégal',
          club: clubs[i % clubs.length] ?? null,
        });
        player = await playersRepo.save(createdPlayer);
        createdPlayers += 1;
      }

      const existingPortrait = await portraitsRepo.findOne({
        where: { player: { id: player.id } },
        relations: { player: true },
      });
      if (existingPortrait) {
        continue;
      }

      let article: Article | null = null;
      if (i <= linkCount) {
        const articleSlug = `seed-portrait-article-${i}`;
        const existingArticle = await articlesRepo.findOne({
          where: { slug: articleSlug },
        });
        if (existingArticle) {
          article = existingArticle;
        } else {
          const title = `Portrait (seed) — ${playerName}`;
          const sections = [
            sectionsRepo.create({
              type: SectionType.HEADING,
              order: 0,
              content: title,
              headingLevel: 2,
            }),
            sectionsRepo.create({
              type: SectionType.PARAGRAPH,
              order: 1,
              content:
                'Article non visible créé automatiquement pour être lié à un portrait.',
            }),
          ];
          const created = await articlesRepo.save(
            articlesRepo.create({
              isVisible: false,
              title,
              slug: articleSlug,
              author: 'BOLD Seed',
              date: new Date(),
              readingTime: '4 min',
              bannerImage: undefined,
              category: portraitsArticleCategory,
              tags: [],
              sections,
            }),
          );
          article = created;
          createdInvisibleArticles += 1;
        }
      }

      const portrait = portraitsRepo.create({
        indice: i,
        pointNumber: 1000 + i * 10,
        signature: `Signature seed #${i}`,
        player,
        category: portraitCategories[i % portraitCategories.length],
        article,
      });
      await portraitsRepo.save(portrait);
      createdPortraits += 1;
    }

    console.log(
      `Seed portraits terminé. Clubs=${clubs.length}, categories=${portraitCategories.length}, joueurs créés=${createdPlayers}, portraits créés=${createdPortraits}, articles invisibles créés=${createdInvisibleArticles} (liés ~${linkCount}/${count}).`,
    );
  } finally {
    await app.close();
  }
}

bootstrap().catch((error: unknown) => {
  console.error('Erreur pendant le seed portraits:', error);
  process.exitCode = 1;
});

