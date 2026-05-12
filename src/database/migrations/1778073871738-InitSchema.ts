import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema migration.
 *
 * NOTE: Made idempotent so it can be safely (re)run even when the schema was
 * previously synchronized outside of the migration system. Every statement
 * uses IF [NOT] EXISTS or DROP/RECREATE guards.
 */
export class InitSchema1778073871738 implements MigrationInterface {
  name = 'InitSchema1778073871738';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "email" character varying NOT NULL, "firstName" character varying NOT NULL, "lastName" character varying, "password" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "homepage_ads" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120), "imageUrl" character varying(2048) NOT NULL, "linkUrl" character varying(2048), "slot" character varying(60) NOT NULL DEFAULT 'homepage-default', "isActive" boolean NOT NULL DEFAULT true, "displayOrder" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e9f2dd4be4733361bea675bd637" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "players" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "slug" character varying NOT NULL, "name" character varying NOT NULL, "nationality" character varying NOT NULL, "profilePhoto" character varying, CONSTRAINT "UQ_7310cf1fe0f6e1b70560e5d5a6c" UNIQUE ("slug"), CONSTRAINT "PK_de22b8fdeee0c33ab55ae71da3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "breaking_news" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(200) NOT NULL, "linkUrl" character varying(2048), "isActive" boolean NOT NULL DEFAULT true, "displayOrder" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1e31c508128af672b21fa262f98" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "client_ad_images" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying NOT NULL, "slot" character varying(30) NOT NULL, "imageUrl" character varying NOT NULL, "targetUrl" character varying, "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_00edf6f64bfd408ad5d323b2b8f" UNIQUE ("slot"), CONSTRAINT "PK_cb53cb54f50a7dbf3a4e1ae7006" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "client_breaking_news" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying, "linkUrl" character varying, "isActive" boolean NOT NULL DEFAULT true, "displayOrder" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_25dd482d51dd7674b7ccf6417ea" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sections_type_enum') THEN
          CREATE TYPE "public"."sections_type_enum" AS ENUM('paragraph', 'heading', 'quote', 'image', 'spacer', 'info_box');
        END IF;
      END $$;`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "sections" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "type" "public"."sections_type_enum" NOT NULL DEFAULT 'paragraph', "order" integer NOT NULL DEFAULT '0', "content" text, "headingLevel" integer, "imageUrl" character varying, "imageCaption" character varying, "quoteAuthor" character varying, "spacerHeight" integer, "infoBoxTitle" character varying, "data" jsonb, "articleId" uuid, CONSTRAINT "PK_f9749dd3bffd880a497d007e450" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "article_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, "slug" character varying NOT NULL, "color" character varying NOT NULL, CONSTRAINT "UQ_0178208684bd3fcacaa7581fceb" UNIQUE ("slug"), CONSTRAINT "PK_eca1ad880e57e2860d7f7a20bc5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "articles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "isVisible" boolean NOT NULL DEFAULT true, "title" character varying NOT NULL, "slug" character varying NOT NULL, "author" character varying NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL, "readingTime" character varying NOT NULL, "bannerImage" character varying, "viewCount" integer NOT NULL DEFAULT '0', "lastViewedAt" TIMESTAMP WITH TIME ZONE, "categoryId" uuid, CONSTRAINT "UQ_1123ff6815c5b8fec0ba9fec370" UNIQUE ("slug"), CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "name" character varying NOT NULL, CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "articles_tags" ("article_id" uuid NOT NULL, "tag_id" uuid NOT NULL, CONSTRAINT "PK_eeda07761f3734f20e6ce8f83dd" PRIMARY KEY ("article_id", "tag_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_0844b8f28aa32ef4bb5885d500" ON "articles_tags" ("article_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_82ccd5e9ccf84c6c2445a5331f" ON "articles_tags" ("tag_id")`,
    );

    await this.addForeignKeyIfMissing(
      queryRunner,
      'sections',
      'FK_8f4d6dd51a254be39fc5786c80a',
      `FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await this.addForeignKeyIfMissing(
      queryRunner,
      'articles',
      'FK_9cf383b5c60045a773ddced7f23',
      `FOREIGN KEY ("categoryId") REFERENCES "article_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await this.addForeignKeyIfMissing(
      queryRunner,
      'articles_tags',
      'FK_0844b8f28aa32ef4bb5885d5003',
      `FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await this.addForeignKeyIfMissing(
      queryRunner,
      'articles_tags',
      'FK_82ccd5e9ccf84c6c2445a5331fa',
      `FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles_tags" DROP CONSTRAINT IF EXISTS "FK_82ccd5e9ccf84c6c2445a5331fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles_tags" DROP CONSTRAINT IF EXISTS "FK_0844b8f28aa32ef4bb5885d5003"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" DROP CONSTRAINT IF EXISTS "FK_9cf383b5c60045a773ddced7f23"`,
    );
    await queryRunner.query(
      `ALTER TABLE "sections" DROP CONSTRAINT IF EXISTS "FK_8f4d6dd51a254be39fc5786c80a"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_82ccd5e9ccf84c6c2445a5331f"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_0844b8f28aa32ef4bb5885d500"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "articles_tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "tags"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "articles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "article_categories"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "sections"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."sections_type_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "client_breaking_news"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "client_ad_images"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "breaking_news"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "players"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "homepage_ads"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
  }

  private async addForeignKeyIfMissing(
    queryRunner: QueryRunner,
    table: string,
    constraintName: string,
    constraintDefinition: string,
  ): Promise<void> {
    const exists = await queryRunner.query(
      `SELECT 1 FROM pg_constraint WHERE conname = $1`,
      [constraintName],
    );
    if (exists.length === 0) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD CONSTRAINT "${constraintName}" ${constraintDefinition}`,
      );
    }
  }
}
