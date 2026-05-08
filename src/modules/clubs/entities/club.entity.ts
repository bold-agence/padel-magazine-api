import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Player } from '../../players/entities/player.entity';

@Entity('clubs')
export class Club extends BaseEntity {
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @OneToMany(() => Player, (player) => player.club)
  players: Player[];
}

