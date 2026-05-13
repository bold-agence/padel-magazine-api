import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import type { LatestResultCategory } from '../latest-result-category';

@Entity('latest_results')
export class LatestResult extends BaseEntity {
  @Column({ type: 'varchar', length: 200 })
  tournamentName: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  location?: string | null;

  @Column({ type: 'date', nullable: true })
  startDate?: string | null;

  @Column({ type: 'date', nullable: true })
  endDate?: string | null;

  @Column({ type: 'date' })
  resultDate: string;

  @Column({ type: 'varchar', length: 120 })
  round: string;

  @Column({ type: 'varchar', length: 240 })
  winners: string;

  @Column({ type: 'varchar', length: 120 })
  score: string;

  @Column({ type: 'varchar', length: 240 })
  losers: string;

  @Column({ type: 'varchar', length: 40, default: 'men' })
  category: LatestResultCategory;

  @Column({ default: true })
  isPublished: boolean;
}
