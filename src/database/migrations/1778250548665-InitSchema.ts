import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1778250548665 implements MigrationInterface {
    name = 'InitSchema1778250548665'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "clubs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "title" character varying NOT NULL, "description" text, CONSTRAINT "PK_bb09bd0c8d5238aeaa8f86ee0d4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "portrait_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "libelle" character varying NOT NULL, CONSTRAINT "UQ_1f5b965ecaee579daabc56ab39a" UNIQUE ("libelle"), CONSTRAINT "PK_cee14fbe8433fbe5ee77d1b5e7c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "portraits" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, "indice" integer NOT NULL, "pointNumber" integer NOT NULL, "signature" text, "playerId" uuid, "categoryId" uuid NOT NULL, "articleId" uuid, CONSTRAINT "REL_f51ff081940492e1c9502799bf" UNIQUE ("playerId"), CONSTRAINT "REL_e52d6157f14857dc850526b167" UNIQUE ("articleId"), CONSTRAINT "PK_2220a7f4bcc0286253fc8dcf9ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "players" ADD "clubId" uuid`);
        await queryRunner.query(`ALTER TABLE "players" ADD CONSTRAINT "FK_f1decadf0dc04223573749cb1ba" FOREIGN KEY ("clubId") REFERENCES "clubs"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "portraits" ADD CONSTRAINT "FK_f51ff081940492e1c9502799bfe" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "portraits" ADD CONSTRAINT "FK_c53a8e24c0e35536958ffc09910" FOREIGN KEY ("categoryId") REFERENCES "portrait_categories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "portraits" ADD CONSTRAINT "FK_e52d6157f14857dc850526b1672" FOREIGN KEY ("articleId") REFERENCES "articles"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "portraits" DROP CONSTRAINT "FK_e52d6157f14857dc850526b1672"`);
        await queryRunner.query(`ALTER TABLE "portraits" DROP CONSTRAINT "FK_c53a8e24c0e35536958ffc09910"`);
        await queryRunner.query(`ALTER TABLE "portraits" DROP CONSTRAINT "FK_f51ff081940492e1c9502799bfe"`);
        await queryRunner.query(`ALTER TABLE "players" DROP CONSTRAINT "FK_f1decadf0dc04223573749cb1ba"`);
        await queryRunner.query(`ALTER TABLE "players" DROP COLUMN "clubId"`);
        await queryRunner.query(`DROP TABLE "portraits"`);
        await queryRunner.query(`DROP TABLE "portrait_categories"`);
        await queryRunner.query(`DROP TABLE "clubs"`);
    }

}
