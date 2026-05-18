import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('newsletter_subscribers')
export class NewsletterSubscriber extends BaseEntity {
  @Column({ length: 80 })
  firstName: string;

  @Column({ length: 80 })
  lastName: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 30 })
  phone: string;

  @Column({ default: false })
  acceptsEmails: boolean;

  @Column({ default: false })
  acceptsPrintMagazine: boolean;
}
