import { Column, Entity, ManyToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Event } from './event.entity';

@Entity('event_tags')
export class EventTag extends BaseEntity {
  @Column({ unique: true })
  name: string;

  @ManyToMany(() => Event, (event) => event.tags)
  events: Event[];
}
