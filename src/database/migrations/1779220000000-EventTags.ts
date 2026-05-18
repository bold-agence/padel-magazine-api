import { MigrationInterface, QueryRunner } from 'typeorm';

export class EventTags1779220000000 implements MigrationInterface {
  name = 'EventTags1779220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTags = await queryRunner.hasTable('event_tags');
    if (!hasTags) {
      await queryRunner.query(
        `CREATE TABLE "event_tags" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "deletedAt" TIMESTAMP WITH TIME ZONE,
          "name" character varying NOT NULL,
          CONSTRAINT "PK_event_tags" PRIMARY KEY ("id")
        )`,
      );
    }

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_event_tags_name_active"
       ON "event_tags" (lower("name"))
       WHERE "deletedAt" IS NULL`,
    );

    const hasJoin = await queryRunner.hasTable('events_event_tags');
    if (!hasJoin) {
      await queryRunner.query(
        `CREATE TABLE "events_event_tags" (
          "event_id" uuid NOT NULL,
          "event_tag_id" uuid NOT NULL,
          CONSTRAINT "PK_events_event_tags" PRIMARY KEY ("event_id", "event_tag_id")
        )`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "events_event_tags" DROP CONSTRAINT IF EXISTS "FK_events_event_tags_event"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events_event_tags" ADD CONSTRAINT "FK_events_event_tags_event" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "events_event_tags" DROP CONSTRAINT IF EXISTS "FK_events_event_tags_tag"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events_event_tags" ADD CONSTRAINT "FK_events_event_tags_tag" FOREIGN KEY ("event_tag_id") REFERENCES "event_tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events_event_tags" DROP CONSTRAINT IF EXISTS "FK_events_event_tags_tag"`,
    );
    await queryRunner.query(
      `ALTER TABLE "events_event_tags" DROP CONSTRAINT IF EXISTS "FK_events_event_tags_event"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "events_event_tags"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_event_tags_name_active"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "event_tags"`);
  }
}
