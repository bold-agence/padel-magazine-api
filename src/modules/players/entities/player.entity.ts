import { Column, Entity, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Club } from '../../clubs/entities/club.entity';
import { Portrait } from '../../portraits/entities/portrait.entity';

@Entity('players')
export class Player extends BaseEntity {
  @Column({ unique: true })
  slug: string;

  @Column()
  name: string;

  @Column()
  nationality: string;

  @Column({ nullable: true })
  profilePhoto?: string;

  @ManyToOne(() => Club, (club) => club.players, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  club?: Club | null;

  @OneToOne(() => Portrait, (portrait) => portrait.player)
  portrait?: Portrait;
}
