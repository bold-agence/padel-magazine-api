import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class ClassementPodiumImages1779000000000 implements MigrationInterface {
  name = 'ClassementPodiumImages1779000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('classements', [
      new TableColumn({
        name: 'podiumFirstImageUrl',
        type: 'varchar',
        length: '2048',
        isNullable: true,
      }),
      new TableColumn({
        name: 'podiumSecondImageUrl',
        type: 'varchar',
        length: '2048',
        isNullable: true,
      }),
      new TableColumn({
        name: 'podiumThirdImageUrl',
        type: 'varchar',
        length: '2048',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('classements', 'podiumThirdImageUrl');
    await queryRunner.dropColumn('classements', 'podiumSecondImageUrl');
    await queryRunner.dropColumn('classements', 'podiumFirstImageUrl');
  }
}
