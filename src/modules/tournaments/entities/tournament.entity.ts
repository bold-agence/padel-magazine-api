import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('tournaments')
export class Tournament extends BaseEntity {
  @Column()
  label: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ unique: true })
  slug: string;

  @Column({ name: 'color_code', length: 9 })
  colorCode: string;
}
