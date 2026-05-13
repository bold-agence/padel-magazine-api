import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { FipRankingEntry } from './fip-ranking-entry.entity';
import type { FipRankingGender } from '../fip-ranking-gender';

@Entity('fip_rankings')
export class FipRanking extends BaseEntity {
  @Column({ type: 'varchar', length: 16, unique: true })
  gender: FipRankingGender;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'date', nullable: true })
  rankingDate?: string | null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  sourceUrl?: string | null;

  @Column({ default: true })
  isPublished: boolean;

  @OneToMany(() => FipRankingEntry, (entry) => entry.ranking)
  entries: FipRankingEntry[];
}
