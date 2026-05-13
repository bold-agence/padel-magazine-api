import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEvents1778601000000 implements MigrationInterface {
  name = 'AddEvents1778601000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('events');

    if (!hasTable) {
      await queryRunner.query(
        `CREATE TABLE "events" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "deletedAt" TIMESTAMP WITH TIME ZONE,
          "title" character varying NOT NULL,
          "startAt" TIMESTAMP WITH TIME ZONE NOT NULL,
          "endAt" TIMESTAMP WITH TIME ZONE,
          "venue" character varying NOT NULL,
          "descriptionHtml" text,
          "coverImageUrl" character varying,
          "tournamentId" uuid,
          CONSTRAINT "PK_events" PRIMARY KEY ("id")
        )`,
      );
    } else {
      await this.addColumnIfMissing(
        queryRunner,
        'events',
        'title',
        `ALTER TABLE "events" ADD "title" character varying NOT NULL`,
      );
      await this.addColumnIfMissing(
        queryRunner,
        'events',
        'startAt',
        `ALTER TABLE "events" ADD "startAt" TIMESTAMP WITH TIME ZONE NOT NULL`,
      );
      await this.addColumnIfMissing(
        queryRunner,
        'events',
        'endAt',
        `ALTER TABLE "events" ADD "endAt" TIMESTAMP WITH TIME ZONE`,
      );
      await this.addColumnIfMissing(
        queryRunner,
        'events',
        'venue',
        `ALTER TABLE "events" ADD "venue" character varying NOT NULL`,
      );
      await this.addColumnIfMissing(
        queryRunner,
        'events',
        'descriptionHtml',
        `ALTER TABLE "events" ADD "descriptionHtml" text`,
      );
      await this.addColumnIfMissing(
        queryRunner,
        'events',
        'coverImageUrl',
        `ALTER TABLE "events" ADD "coverImageUrl" character varying`,
      );
      await this.addColumnIfMissing(
        queryRunner,
        'events',
        'tournamentId',
        `ALTER TABLE "events" ADD "tournamentId" uuid`,
      );
    }

    await this.addForeignKeyIfMissing(
      queryRunner,
      'FK_events_tournament',
      `ALTER TABLE "events" ADD CONSTRAINT "FK_events_tournament" FOREIGN KEY ("tournamentId") REFERENCES "tournaments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" DROP CONSTRAINT IF EXISTS "FK_events_tournament"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "events"`);
  }

  private async addColumnIfMissing(
    queryRunner: QueryRunner,
    table: string,
    column: string,
    query: string,
  ): Promise<void> {
    const hasColumn = await queryRunner.hasColumn(table, column);
    if (!hasColumn) {
      await queryRunner.query(query);
    }
  }

  private async addForeignKeyIfMissing(
    queryRunner: QueryRunner,
    constraintName: string,
    query: string,
  ): Promise<void> {
    const exists = await queryRunner.query(
      `SELECT 1 FROM pg_constraint WHERE conname = $1`,
      [constraintName],
    );
    if (exists.length === 0) {
      await queryRunner.query(query);
    }
  }
}
