import { MigrationInterface, QueryRunner } from "typeorm";

export class FipRankings1778633200000 implements MigrationInterface {
    name = 'FipRankings1778633200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "fip_rankings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "gender" character varying(16) NOT NULL, "title" character varying(200) NOT NULL, "rankingDate" date, "sourceUrl" character varying(512), "isPublished" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_035916d343e09465fa6d89dc88b" UNIQUE ("gender"), CONSTRAINT "PK_6368ab4d37bf2f4697281d1536d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "fip_ranking_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "sortOrder" integer NOT NULL, "rank" integer NOT NULL, "playerName" character varying(200) NOT NULL, "countryCode" character varying(12), "points" integer NOT NULL, "playerImageUrl" character varying(1024), "rankingId" uuid NOT NULL, CONSTRAINT "PK_d0f51c1d1a046198cf95639ed3e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "fip_ranking_entries" ADD CONSTRAINT "FK_0fd6d0055770807d2173337c3fe" FOREIGN KEY ("rankingId") REFERENCES "fip_rankings"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "fip_ranking_entries" DROP CONSTRAINT "FK_0fd6d0055770807d2173337c3fe"`);
        await queryRunner.query(`DROP TABLE "fip_ranking_entries"`);
        await queryRunner.query(`DROP TABLE "fip_rankings"`);
    }
}

