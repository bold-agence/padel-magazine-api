import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Section } from './section.entity';
import { Tag } from './tag.entity';
import { ArticleCategory } from './article-category.entity';

@Entity('articles')
export class Article extends BaseEntity {
  @Column({ default: true })
  isVisible: boolean;

  @Column()
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  author: string;

  @Column({ type: 'timestamptz' })
  date: Date;

  @Column()
  readingTime: string;

  @Column({ nullable: true })
  bannerImage?: string;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'timestamptz', nullable: true })
  lastViewedAt?: Date | null;

  @OneToMany(() => Section, (section) => section.article, {
    cascade: true,
  })
  sections: Section[];

  @ManyToMany(() => Tag, (tag) => tag.articles, { cascade: true })
  @JoinTable({
    name: 'articles_tags',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
  })
  tags: Tag[];

  @ManyToOne(() => ArticleCategory, (category) => category.primaryArticles, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  category?: ArticleCategory | null;

  @ManyToMany(() => ArticleCategory, (category) => category.articles)
  @JoinTable({
    name: 'articles_categories',
    joinColumn: { name: 'article_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' },
  })
  categories: ArticleCategory[];
}
