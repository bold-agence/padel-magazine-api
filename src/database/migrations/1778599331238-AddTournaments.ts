import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTournaments1778599331238 implements MigrationInterface {
  name = 'AddTournaments1778599331238';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('tournaments');
    if (!hasTable) {
      await queryRunner.query(
        `CREATE TABLE "tournaments" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "deletedAt" TIMESTAMP WITH TIME ZONE,
          "label" character varying NOT NULL,
          "description" text,
          "slug" character varying NOT NULL,
          "color_code" character varying(9) NOT NULL,
          CONSTRAINT "UQ_tournaments_slug" UNIQUE ("slug"),
          CONSTRAINT "PK_tournaments" PRIMARY KEY ("id")
        )`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "tournaments"`);
  }
}
