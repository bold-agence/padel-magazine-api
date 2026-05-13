import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Event } from '../../events/entities/event.entity';

@Entity('lives')
export class Live extends BaseEntity {
  @Column({ type: 'varchar', length: 5 })
  startTime: string; // HH:mm

  @Column({ type: 'varchar', length: 5, nullable: true })
  endTime?: string | null; // HH:mm

  @Column({ type: 'varchar' })
  liveUrl: string;

  @Column({ type: 'varchar', nullable: true })
  replayUrl?: string | null;

  @Column({ type: 'varchar', nullable: true })
  coverImageUrl?: string | null;

  @ManyToOne(() => Event, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  event: Event;
}
