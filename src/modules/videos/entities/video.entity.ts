import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { VideoType } from './video-type.entity';

@Entity('videos')
export class Video extends BaseEntity {
  @Column({ type: 'varchar', length: 240 })
  title: string;

  @Column({ type: 'varchar', length: 512 })
  youtubeLink: string;

  @ManyToOne(() => VideoType, (t) => t.videos, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'videoTypeId' })
  videoType: VideoType;
}
