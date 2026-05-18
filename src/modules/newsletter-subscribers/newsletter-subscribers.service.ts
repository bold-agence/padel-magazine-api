import {
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNewsletterSubscriberDto } from './dto/create-newsletter-subscriber.dto';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';

@Injectable()
export class NewsletterSubscribersService {
  private readonly logger = new Logger(NewsletterSubscribersService.name);

  constructor(
    @InjectRepository(NewsletterSubscriber)
    private readonly repo: Repository<NewsletterSubscriber>,
  ) {}

  async create(dto: CreateNewsletterSubscriberDto): Promise<NewsletterSubscriber> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.repo.findOne({ where: { email } });
    if (existing) {
      throw new ConflictException('Cette adresse e-mail est déjà inscrite.');
    }

    const subscriber = this.repo.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email,
      phone: dto.phone.trim(),
      acceptsEmails: dto.acceptsEmails === true,
      acceptsPrintMagazine: dto.acceptsPrintMagazine === true,
    });

    const saved = await this.repo.save(subscriber);
    this.logger.log(`Newsletter subscriber created (id=${saved.id}, email=${saved.email})`);
    return saved;
  }

  async findAll(): Promise<NewsletterSubscriber[]> {
    return this.repo.find({
      order: { createdAt: 'DESC' },
    });
  }
}
