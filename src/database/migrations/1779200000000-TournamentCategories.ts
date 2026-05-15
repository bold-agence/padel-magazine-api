import { MigrationInterface, QueryRunner } from 'typeorm';

export class TournamentCategories1779200000000 implements MigrationInterface {
  name = 'TournamentCategories1779200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('tournament_categories');
    if (!hasTable) {
      await queryRunner.query(
        `CREATE TABLE "tournament_categories" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "deletedAt" TIMESTAMP WITH TIME ZONE,
          "label" character varying NOT NULL,
          "slug" character varying NOT NULL,
          "description" text,
          "tournamentId" uuid NOT NULL,
          CONSTRAINT "PK_tournament_categories" PRIMARY KEY ("id")
        )`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "tournament_categories" DROP CONSTRAINT IF EXISTS "FK_tournament_categories_tournament"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tournament_categories" ADD CONSTRAINT "FK_tournament_categories_tournament" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_tournament_category_tournament_slug_active"
       ON "tournament_categories" ("tournamentId", lower("slug"))
       WHERE "deletedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_tournament_category_tournament_slug_active"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tournament_categories" DROP CONSTRAINT IF EXISTS "FK_tournament_categories_tournament"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "tournament_categories"`);
  }
}
