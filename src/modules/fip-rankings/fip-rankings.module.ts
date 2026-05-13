import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FipRankingEntry } from './entities/fip-ranking-entry.entity';
import { FipRanking } from './entities/fip-ranking.entity';
import { FipRankingsController } from './fip-rankings.controller';
import { FipRankingsService } from './fip-rankings.service';

@Module({
  imports: [TypeOrmModule.forFeature([FipRanking, FipRankingEntry])],
  controllers: [FipRankingsController],
  providers: [FipRankingsService],
  exports: [FipRankingsService],
})
export class FipRankingsModule {}

