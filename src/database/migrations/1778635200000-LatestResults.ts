import { MigrationInterface, QueryRunner } from "typeorm";

export class LatestResults1778635200000 implements MigrationInterface {
    name = 'LatestResults1778635200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "latest_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "tournamentName" character varying(200) NOT NULL, "location" character varying(200), "startDate" date, "endDate" date, "resultDate" date NOT NULL, "round" character varying(120) NOT NULL, "winners" character varying(240) NOT NULL, "score" character varying(120) NOT NULL, "losers" character varying(240) NOT NULL, "category" character varying(40) NOT NULL DEFAULT 'men', "scope" character varying(40) NOT NULL DEFAULT 'international', "isPublished" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_26f5c98403068cf10e9ccb36725" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "latest_results"`);
    }
}
