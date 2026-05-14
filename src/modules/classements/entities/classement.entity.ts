import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ClassementLine } from './classement-line.entity';

@Entity('classements')
export class Classement extends BaseEntity {
  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 120, nullable: true })
  pointsNowLabel?: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  pointsPrevLabel?: string | null;

  /** Photo 1er (URL MinIO / publique) */
  @Column({ type: 'varchar', length: 2048, nullable: true })
  podiumFirstImageUrl?: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  podiumSecondImageUrl?: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  podiumThirdImageUrl?: string | null;

  @OneToMany(() => ClassementLine, (line) => line.classement)
  lines: ClassementLine[];
}
