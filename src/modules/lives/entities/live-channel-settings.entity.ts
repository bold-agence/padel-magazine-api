import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Singleton-style entity: the application is expected to hold a single row
 * describing the channel used to broadcast lives.
 */
@Entity('live_channel_settings')
export class LiveChannelSettings extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  channelName?: string | null;

  @Column({ type: 'varchar', nullable: true })
  channelUrl?: string | null;
}
