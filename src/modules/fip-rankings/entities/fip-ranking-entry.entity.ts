import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { FipRanking } from './fip-ranking.entity';

@Entity('fip_ranking_entries')
export class FipRankingEntry extends BaseEntity {
  @ManyToOne(() => FipRanking, (ranking) => ranking.entries, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'rankingId' })
  ranking: FipRanking;

  @Column({ type: 'int' })
  sortOrder: number;

  @Column({ type: 'int' })
  rank: number;

  @Column({ type: 'varchar', length: 200 })
  playerName: string;

  @Column({ type: 'varchar', length: 12, nullable: true })
  countryCode?: string | null;

  @Column({ type: 'int' })
  points: number;

  @Column({ type: 'varchar', length: 1024, nullable: true })
  playerImageUrl?: string | null;
}

