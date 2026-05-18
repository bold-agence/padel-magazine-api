import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterSubscriber } from './entities/newsletter-subscriber.entity';
import { NewsletterSubscribersController } from './newsletter-subscribers.controller';
import { NewsletterSubscribersService } from './newsletter-subscribers.service';

@Module({
  imports: [TypeOrmModule.forFeature([NewsletterSubscriber])],
  controllers: [NewsletterSubscribersController],
  providers: [NewsletterSubscribersService],
  exports: [NewsletterSubscribersService],
})
export class NewsletterSubscribersModule {}
