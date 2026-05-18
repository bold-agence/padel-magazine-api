import {
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
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
    const existing = await this.repo
      .createQueryBuilder('subscriber')
      .where('LOWER(subscriber.email) = :email', { email })
      .getOne();

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

    try {
      const saved = await this.repo.save(subscriber);
      this.logger.log(`Newsletter subscriber created (id=${saved.id}, email=${saved.email})`);
      return saved;
    } catch (error) {
      if (this.isDuplicateEmailError(error)) {
        throw new ConflictException('Cette adresse e-mail est déjà inscrite.');
      }
      throw error;
    }
  }

  private isDuplicateEmailError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }
    const driverError = error.driverError as { code?: string };
    return driverError?.code === '23505';
  }

  async findAll(): Promise<NewsletterSubscriber[]> {
    return this.repo.find({
      order: { createdAt: 'DESC' },
    });
  }
}
