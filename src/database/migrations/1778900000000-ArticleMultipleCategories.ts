import { MigrationInterface, QueryRunner } from 'typeorm';

export class ArticleMultipleCategories1778900000000
  implements MigrationInterface
{
  name = 'ArticleMultipleCategories1778900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "articles_categories" ("article_id" uuid NOT NULL, "category_id" uuid NOT NULL, CONSTRAINT "PK_articles_categories" PRIMARY KEY ("article_id", "category_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_articles_categories_article" ON "articles_categories" ("article_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_articles_categories_category" ON "articles_categories" ("category_id")`,
    );
    await this.addForeignKeyIfMissing(
      queryRunner,
      'articles_categories',
      'FK_articles_categories_article',
      `FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await this.addForeignKeyIfMissing(
      queryRunner,
      'articles_categories',
      'FK_articles_categories_category',
      `FOREIGN KEY ("category_id") REFERENCES "article_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `INSERT INTO "articles_categories" ("article_id", "category_id")
       SELECT "id", "categoryId"
       FROM "articles"
       WHERE "categoryId" IS NOT NULL
       ON CONFLICT DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles_categories" DROP CONSTRAINT IF EXISTS "FK_articles_categories_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles_categories" DROP CONSTRAINT IF EXISTS "FK_articles_categories_article"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_articles_categories_category"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IDX_articles_categories_article"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "articles_categories"`);
  }

  private async addForeignKeyIfMissing(
    queryRunner: QueryRunner,
    table: string,
    constraintName: string,
    constraintDefinition: string,
  ): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = '${constraintName}'
        ) THEN
          ALTER TABLE "${table}" ADD CONSTRAINT "${constraintName}" ${constraintDefinition};
        END IF;
      END $$;`,
    );
  }
}
