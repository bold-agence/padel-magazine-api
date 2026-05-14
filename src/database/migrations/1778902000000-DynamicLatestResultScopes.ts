import { MigrationInterface, QueryRunner } from "typeorm";

export class DynamicLatestResultScopes1778902000000 implements MigrationInterface {
    name = 'DynamicLatestResultScopes1778902000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "latest_result_scopes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120) NOT NULL, "slug" character varying(120) NOT NULL, "displayOrder" integer NOT NULL DEFAULT '0', "isActive" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_latest_result_scopes_slug" UNIQUE ("slug"), CONSTRAINT "PK_latest_result_scopes" PRIMARY KEY ("id"))`);
        await queryRunner.query(`INSERT INTO "latest_result_scopes" ("name", "slug", "displayOrder", "isActive") VALUES ('International', 'international', 0, true), ('Sénégal', 'senegal', 1, true) ON CONFLICT ("slug") DO NOTHING`);
        await queryRunner.query(`ALTER TABLE "latest_results" ADD COLUMN IF NOT EXISTS "scopeId" uuid`);
        await queryRunner.query(`UPDATE "latest_results" AS result SET "scopeId" = COALESCE((SELECT "id" FROM "latest_result_scopes" WHERE "slug" = LOWER(result."scope") LIMIT 1), (SELECT "id" FROM "latest_result_scopes" WHERE "slug" = 'international' LIMIT 1)) WHERE result."scopeId" IS NULL`);
        await queryRunner.query(`ALTER TABLE "latest_results" ALTER COLUMN "scopeId" SET NOT NULL`);
        await queryRunner.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_latest_results_scope') THEN ALTER TABLE "latest_results" ADD CONSTRAINT "FK_latest_results_scope" FOREIGN KEY ("scopeId") REFERENCES "latest_result_scopes"("id") ON DELETE RESTRICT ON UPDATE NO ACTION; END IF; END $$`);
        await queryRunner.query(`ALTER TABLE "latest_results" DROP COLUMN IF EXISTS "scope"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "latest_results" ADD COLUMN IF NOT EXISTS "scope" character varying(40) NOT NULL DEFAULT 'international'`);
        await queryRunner.query(`UPDATE "latest_results" AS result SET "scope" = COALESCE((SELECT "slug" FROM "latest_result_scopes" WHERE "id" = result."scopeId" LIMIT 1), 'international') WHERE result."scopeId" IS NOT NULL`);
        await queryRunner.query(`ALTER TABLE "latest_results" DROP CONSTRAINT IF EXISTS "FK_latest_results_scope"`);
        await queryRunner.query(`ALTER TABLE "latest_results" DROP COLUMN IF EXISTS "scopeId"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "latest_result_scopes"`);
    }
}
