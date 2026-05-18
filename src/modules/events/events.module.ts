import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './entities/event.entity';
import { EventTag } from './entities/event-tag.entity';
import { EventTagsService } from './event-tags.service';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { TournamentCategory } from '../tournament-categories/entities/tournament-category.entity';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, EventTag, Tournament, TournamentCategory]),
    MinioModule,
  ],
  controllers: [EventsController],
  providers: [EventsService, EventTagsService],
  exports: [EventsService],
})
export class EventsModule {}
