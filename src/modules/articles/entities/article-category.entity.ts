import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Article } from './article.entity';

@Entity('article_categories')
export class ArticleCategory extends BaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  color: string;

  @OneToMany(() => Article, (article) => article.category)
  primaryArticles: Article[];

  @ManyToMany(() => Article, (article) => article.categories)
  articles: Article[];
}
