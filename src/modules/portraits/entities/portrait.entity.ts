import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Player } from '../../players/entities/player.entity';
import { PortraitCategory } from './portrait-category.entity';
import { Article } from '../../articles/entities/article.entity';

@Entity('portraits')
export class Portrait extends BaseEntity {
  @Column({ type: 'int' })
  indice: number;

  @Column({ type: 'int' })
  pointNumber: number;

  @Column({ type: 'text', nullable: true })
  signature?: string | null;

  @OneToOne(() => Player, (player) => player.portrait, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'playerId' })
  player: Player;

  @ManyToOne(() => PortraitCategory, (category) => category.portraits, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  category: PortraitCategory;

  @OneToOne(() => Article, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'articleId' })
  article?: Article | null;
}

