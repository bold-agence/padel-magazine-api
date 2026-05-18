import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { TournamentCategory } from '../../tournament-categories/entities/tournament-category.entity';
import { Tournament } from '../../tournaments/entities/tournament.entity';
import { EventTag } from './event-tag.entity';

@Entity('events')
export class Event extends BaseEntity {
  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'timestamptz' })
  startAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  endAt?: Date | null;

  @Column()
  venue: string;

  @Column({ type: 'text', nullable: true })
  descriptionHtml?: string | null;

  @Column({ type: 'varchar', nullable: true })
  coverImageUrl?: string | null;

  @ManyToOne(() => Tournament, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  tournament?: Tournament | null;

  @ManyToOne(() => TournamentCategory, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  tournamentCategory?: TournamentCategory | null;

  @ManyToMany(() => EventTag, (tag) => tag.events, { cascade: true })
  @JoinTable({
    name: 'events_event_tags',
    joinColumn: { name: 'event_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'event_tag_id', referencedColumnName: 'id' },
  })
  tags: EventTag[];
}
