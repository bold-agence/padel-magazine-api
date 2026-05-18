import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewsletterSubscribers1779230000000 implements MigrationInterface {
  name = 'NewsletterSubscribers1779230000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.hasTable('newsletter_subscribers');
    if (!hasTable) {
      await queryRunner.query(
        `CREATE TABLE "newsletter_subscribers" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
          "deletedAt" TIMESTAMP WITH TIME ZONE,
          "firstName" character varying(80) NOT NULL,
          "lastName" character varying(80) NOT NULL,
          "email" character varying NOT NULL,
          "phone" character varying(30) NOT NULL,
          "acceptsEmails" boolean NOT NULL DEFAULT false,
          "acceptsPrintMagazine" boolean NOT NULL DEFAULT false,
          CONSTRAINT "PK_newsletter_subscribers" PRIMARY KEY ("id")
        )`,
      );
    }

    await queryRunner.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS "UQ_newsletter_subscribers_email_active"
       ON "newsletter_subscribers" (lower("email"))
       WHERE "deletedAt" IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "UQ_newsletter_subscribers_email_active"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "newsletter_subscribers"`);
  }
}
