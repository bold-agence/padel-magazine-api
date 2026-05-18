import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validation.schema';
import configuration from './config/configuration';
import { UsersModule } from './modules/users/users.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { PlayersModule } from './modules/players/players.module';
import { MinioModule } from './modules/minio/minio.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { ClientContentModule } from './modules/client-content/client-content.module';
import { ClubsModule } from './modules/clubs/clubs.module';
import { PortraitsModule } from './modules/portraits/portraits.module';
import { ClassementsModule } from './modules/classements/classements.module';
import { VideosModule } from './modules/videos/videos.module';
import { TournamentsModule } from './modules/tournaments/tournaments.module';
import { EventsModule } from './modules/events/events.module';
import { FipRankingsModule } from './modules/fip-rankings/fip-rankings.module';
import { LatestResultsModule } from './modules/latest-results/latest-results.module';
import { LivesModule } from './modules/lives/lives.module';
import { TournamentCategoriesModule } from './modules/tournament-categories/tournament-categories.module';
import { NewsletterSubscribersModule } from './modules/newsletter-subscribers/newsletter-subscribers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    DatabaseModule,
    MinioModule,
    UsersModule,
    AuthModule,
    ClubsModule,
    PlayersModule,
    ArticlesModule,
    ClientContentModule,
    PortraitsModule,
    ClassementsModule,
    VideosModule,
    TournamentsModule,
    TournamentCategoriesModule,
    EventsModule,
    FipRankingsModule,
    LatestResultsModule,
    LivesModule,
    NewsletterSubscribersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
