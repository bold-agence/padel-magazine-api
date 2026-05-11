import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1778511918184 implements MigrationInterface {
    name = 'InitSchema1778511918184'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "video_types" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying(160) NOT NULL, CONSTRAINT "UQ_4e4d9bd45d0f4727306bf604041" UNIQUE ("title"), CONSTRAINT "PK_64d90170e78fff39e7eb07906c0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "videos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying(240) NOT NULL, "youtubeLink" character varying(512) NOT NULL, "videoTypeId" uuid NOT NULL, CONSTRAINT "PK_e4c86c0cf95aff16e9fb8220f6b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "videos" ADD CONSTRAINT "FK_9f7cab9cc1a53c2f7e8deb4e0f9" FOREIGN KEY ("videoTypeId") REFERENCES "video_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "videos" DROP CONSTRAINT "FK_9f7cab9cc1a53c2f7e8deb4e0f9"`);
        await queryRunner.query(`DROP TABLE "videos"`);
        await queryRunner.query(`DROP TABLE "video_types"`);
    }

}
