import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateNewsletterSubscriberDto } from './dto/create-newsletter-subscriber.dto';
import { NewsletterSubscribersService } from './newsletter-subscribers.service';

@Controller('newsletter-subscribers')
export class NewsletterSubscribersController {
  constructor(
    private readonly newsletterSubscribersService: NewsletterSubscribersService,
  ) {}

  @Post()
  create(@Body() dto: CreateNewsletterSubscriberDto) {
    return this.newsletterSubscribersService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.newsletterSubscribersService.findAll();
  }
}
