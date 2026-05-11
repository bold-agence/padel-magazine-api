import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1778500494970 implements MigrationInterface {
    name = 'InitSchema1778500494970'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "classement_lines" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "sortOrder" integer NOT NULL, "rank" integer NOT NULL, "playerName" character varying(200) NOT NULL, "pointsNow" integer NOT NULL, "tournaments" integer NOT NULL, "previousRank" integer NOT NULL, "pointsPrev" integer NOT NULL, "rankDelta" character varying(32) NOT NULL, "pointsDelta" character varying(32) NOT NULL, "classementId" uuid, CONSTRAINT "PK_b6ecbd2463e22a187c57c682e71" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "classements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "slug" character varying(120) NOT NULL, "title" character varying(200) NOT NULL, "pointsNowLabel" character varying(120), "pointsPrevLabel" character varying(120), CONSTRAINT "UQ_d846632204165efb61ab085dd01" UNIQUE ("slug"), CONSTRAINT "PK_4ea08b85d6dffbf63d8f5b24713" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "classement_lines" ADD CONSTRAINT "FK_f514cc57b950502314a9a52fc18" FOREIGN KEY ("classementId") REFERENCES "classements"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classement_lines" DROP CONSTRAINT "FK_f514cc57b950502314a9a52fc18"`);
        await queryRunner.query(`DROP TABLE "classements"`);
        await queryRunner.query(`DROP TABLE "classement_lines"`);
    }

}
