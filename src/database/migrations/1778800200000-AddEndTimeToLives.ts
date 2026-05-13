import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEndTimeToLives1778800200000 implements MigrationInterface {
  name = 'AddEndTimeToLives1778800200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('lives');
    if (!hasTable) {
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "lives" ADD COLUMN IF NOT EXISTS "endTime" character varying(5)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lives" DROP COLUMN IF EXISTS "endTime"`,
    );
  }
}
