import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

export type AdSlot =
  | 'header_main'
  | 'home_leaderboard'
  | 'sidebar_top'
  | 'sidebar_bottom';

@Entity('client_ad_images')
export class AdImage extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  slot: AdSlot;

  @Column()
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  targetUrl?: string | null;

  @Column({ default: true })
  isActive: boolean;
}
