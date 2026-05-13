import { MigrationInterface, QueryRunner } from "typeorm";

export class SimplifyLatestResults1778635300000 implements MigrationInterface {
    name = 'SimplifyLatestResults1778635300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "latest_results" DROP COLUMN IF EXISTS "displayOrder"`);
        await queryRunner.query(`ALTER TABLE "latest_results" DROP COLUMN IF EXISTS "colorCode"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "latest_results" ADD COLUMN IF NOT EXISTS "displayOrder" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "latest_results" ADD COLUMN IF NOT EXISTS "colorCode" character varying(9) NOT NULL DEFAULT '#df4548'`);
    }
}
