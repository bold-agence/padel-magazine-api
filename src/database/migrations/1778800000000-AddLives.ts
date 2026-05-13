import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLives1778800000000 implements MigrationInterface {
  name = 'AddLives1778800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // live_channel_settings (singleton-style table)
    const hasSettings = await queryRunner.hasTable('live_channel_settings');
    if (!hasSettings) {
      await queryRunner.query(
        `CREATE TABLE "live_channel_settings" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "deletedAt" TIMESTAMP WITH TIME ZONE,
          "channelName" character varying,
          "channelUrl" character varying,
          CONSTRAINT "PK_live_channel_settings" PRIMARY KEY ("id")
        )`,
      );
    }

    // lives
    const hasLives = await queryRunner.hasTable('lives');
    if (!hasLives) {
      await queryRunner.query(
        `CREATE TABLE "lives" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "deletedAt" TIMESTAMP WITH TIME ZONE,
          "startTime" character varying(5) NOT NULL,
          "liveUrl" character varying NOT NULL,
          "replayUrl" character varying,
          "coverImageUrl" character varying,
          "eventId" uuid NOT NULL,
          CONSTRAINT "PK_lives" PRIMARY KEY ("id")
        )`,
      );
    } else {
      await this.addColumnIfMissing(
        queryRunner,
        'lives',
        'startTime',
        `ALTER TABLE "lives" ADD "startTime" character varying(5) NOT NULL`,
      );
      await this.addColumnIfMissing(
        queryRunner,
        'lives',
        'liveUrl',
        `ALTER TABLE "lives" ADD "liveUrl" character varying NOT NULL`,
      );
      await this.addColumnIfMissing(
        queryRunner,
        'lives',
        'replayUrl',
        `ALTER TABLE "lives" ADD "replayUrl" character varying`,
      );
      await this.addColumnIfMissing(
        queryRunner,
        'lives',
        'coverImageUrl',
        `ALTER TABLE "lives" ADD "coverImageUrl" character varying`,
      );
      await this.addColumnIfMissing(
        queryRunner,
        'lives',
        'eventId',
        `ALTER TABLE "lives" ADD "eventId" uuid NOT NULL`,
      );
    }

    await this.addForeignKeyIfMissing(
      queryRunner,
      'FK_lives_event',
      `ALTER TABLE "lives" ADD CONSTRAINT "FK_lives_event" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "lives" DROP CONSTRAINT IF EXISTS "FK_lives_event"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "lives"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "live_channel_settings"`);
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
    const exists: Array<unknown> = await queryRunner.query(
      `SELECT 1 FROM pg_constraint WHERE conname = $1`,
      [constraintName],
    );
    if (exists.length === 0) {
      await queryRunner.query(query);
    }
  }
}
