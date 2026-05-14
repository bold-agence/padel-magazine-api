import { MigrationInterface, QueryRunner } from "typeorm";

export class AddScopeToLatestResults1778901000000 implements MigrationInterface {
    name = 'AddScopeToLatestResults1778901000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "latest_results" ADD COLUMN IF NOT EXISTS "scope" character varying(40) NOT NULL DEFAULT 'international'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "latest_results" DROP COLUMN IF EXISTS "scope"`);
    }
}
