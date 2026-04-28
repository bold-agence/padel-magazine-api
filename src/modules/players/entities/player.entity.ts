import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

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
}
