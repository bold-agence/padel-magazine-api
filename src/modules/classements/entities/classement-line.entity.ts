import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Classement } from './classement.entity';

@Entity('classement_lines')
export class ClassementLine extends BaseEntity {
  @ManyToOne(() => Classement, (c) => c.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classementId' })
  classement: Classement;

  /** Ordre d’affichage (ligne dans le fichier, 0-based) */
  @Column({ type: 'int' })
  sortOrder: number;

  /** Position affichée (peut être ex aequo) — aligné sur RankingRow.rank */
  @Column({ type: 'int', name: 'rank' })
  rank: number;

  @Column({ type: 'varchar', length: 200 })
  playerName: string;

  @Column({ type: 'int' })
  pointsNow: number;

  @Column({ type: 'int' })
  tournaments: number;

  @Column({ type: 'int' })
  previousRank: number;

  @Column({ type: 'int' })
  pointsPrev: number;

  @Column({ type: 'varchar', length: 32 })
  rankDelta: string;

  @Column({ type: 'varchar', length: 32 })
  pointsDelta: string;
}
