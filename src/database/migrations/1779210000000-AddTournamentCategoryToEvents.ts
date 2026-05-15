import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTournamentCategoryToEvents1779210000000
  implements MigrationInterface
{
  name = 'AddTournamentCategoryToEvents1779210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasEvents = await queryRunner.hasTable('events');
    if (!hasEvents) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "tournamentCategoryId" uuid`,
    );

    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "FK_events_tournament_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" ADD CONSTRAINT "FK_events_tournament_category" FOREIGN KEY ("tournamentCategoryId") REFERENCES "tournament_categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "FK_events_tournament_category"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events" DROP COLUMN IF EXISTS "tournamentCategoryId"`,
    );
  }
}
