import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Tournament } from '../../tournaments/entities/tournament.entity';

@Entity('tournament_categories')
export class TournamentCategory extends BaseEntity {
  @Column()
  label: string;

  @Column()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @ManyToOne(() => Tournament, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'tournamentId' })
  tournament: Tournament;
}
