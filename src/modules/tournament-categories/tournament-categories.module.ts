import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tournament } from '../tournaments/entities/tournament.entity';
import { TournamentCategory } from './entities/tournament-category.entity';
import { TournamentCategoriesController } from './tournament-categories.controller';
import { TournamentCategoriesService } from './tournament-categories.service';

@Module({
  imports: [TypeOrmModule.forFeature([TournamentCategory, Tournament])],
  controllers: [TournamentCategoriesController],
  providers: [TournamentCategoriesService],
  exports: [TournamentCategoriesService],
})
export class TournamentCategoriesModule {}
