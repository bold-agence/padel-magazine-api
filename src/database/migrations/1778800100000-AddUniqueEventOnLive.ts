import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUniqueEventOnLive1778800100000 implements MigrationInterface {
  name = 'AddUniqueEventOnLive1778800100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('lives');
    if (!hasTable) {
      return;
    }

    // Partial unique index: a given event can host at most one *active* live
    // (soft-deleted rows are excluded so the constraint stays consistent with
    // the soft-delete semantics used everywhere else in the API).
    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_lives_event_active"
       ON "lives" ("eventId")
       WHERE "deletedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_lives_event_active"`,
    );
  }
}
