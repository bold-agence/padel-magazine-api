import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Portrait } from './portrait.entity';

@Entity('portrait_categories')
export class PortraitCategory extends BaseEntity {
  @Column({ unique: true })
  libelle: string;

  @OneToMany(() => Portrait, (portrait) => portrait.category)
  portraits: Portrait[];
}

