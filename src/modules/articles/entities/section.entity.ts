import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Article } from './article.entity';

export enum SectionType {
  PARAGRAPH = 'paragraph',
  HEADING = 'heading',
  QUOTE = 'quote',
  IMAGE = 'image',
  SPACER = 'spacer',
  INFO_BOX = 'info_box',
}

@Entity('sections')
export class Section extends BaseEntity {
  @Column({
    type: 'enum',
    enum: SectionType,
    default: SectionType.PARAGRAPH,
  })
  type: SectionType;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'int', nullable: true })
  headingLevel?: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: true })
  imageCaption?: string;

  @Column({ nullable: true })
  quoteAuthor?: string;

  @Column({ type: 'int', nullable: true })
  spacerHeight?: number;

  @Column({ nullable: true })
  infoBoxTitle?: string;

  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, unknown>;

  @ManyToOne(() => Article, (article) => article.sections, {
    onDelete: 'CASCADE',
  })
  article: Article;
}
