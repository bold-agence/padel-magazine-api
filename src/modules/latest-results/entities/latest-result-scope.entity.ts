import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LatestResult } from './latest-result.entity';

@Entity('latest_result_scopes')
export class LatestResultScope {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 120 })
  name: string;

  @Column({ type: 'varchar', length: 120, unique: true })
  slug: string;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => LatestResult, (result) => result.scope)
  results: LatestResult[];
}
