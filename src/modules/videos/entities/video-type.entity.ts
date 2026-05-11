import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Video } from './video.entity';

@Entity('video_types')
export class VideoType extends BaseEntity {
  @Column({ type: 'varchar', length: 160, unique: true })
  title: string;

  @OneToMany(() => Video, (video) => video.videoType)
  videos: Video[];
}
