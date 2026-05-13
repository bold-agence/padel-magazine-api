import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSlugToEvents1778700000000 implements MigrationInterface {
  name = 'AddSlugToEvents1778700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('events');
    if (!hasTable) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "slug" character varying`,
    );

    // Backfill any null slug values using a deterministic fallback
    // derived from the title and the row id so we don't violate the
    // uniqueness constraint for existing rows.
    await queryRunner.query(
      `UPDATE "events"
       SET "slug" = LOWER(
         REGEXP_REPLACE(
           COALESCE(NULLIF(TRIM("title"), ''), 'event'),
           '[^a-zA-Z0-9]+',
           '-',
           'g'
         )
       ) || '-' || LEFT("id"::text, 8)
       WHERE "slug" IS NULL`,
    );

    await queryRunner.query(
      `ALTER TABLE "events" ALTER COLUMN "slug" SET NOT NULL`,
    );

    await this.addUniqueConstraintIfMissing(
      queryRunner,
      'UQ_events_slug',
      `ALTER TABLE "events" ADD CONSTRAINT "UQ_events_slug" UNIQUE ("slug")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "UQ_events_slug"`,
    );
    await queryRunner.query(`ALTER TABLE "events" DROP COLUMN IF EXISTS "slug"`);
  }

  private async addUniqueConstraintIfMissing(
    queryRunner: QueryRunner,
    constraintName: string,
    query: string,
  ): Promise<void> {
    const exists: Array<{ '?column?': number }> = await queryRunner.query(
      `SELECT 1 FROM pg_constraint WHERE conname = $1`,
      [constraintName],
    );
    if (exists.length === 0) {
      await queryRunner.query(query);
    }
  }
}
