import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LatestResult } from './entities/latest-result.entity';
import { LatestResultScope } from './entities/latest-result-scope.entity';
import { LatestResultScopesController } from './latest-result-scopes.controller';
import { LatestResultsController } from './latest-results.controller';
import { LatestResultsService } from './latest-results.service';

@Module({
  imports: [TypeOrmModule.forFeature([LatestResult, LatestResultScope])],
  controllers: [LatestResultsController, LatestResultScopesController],
  providers: [LatestResultsService],
  exports: [LatestResultsService],
})
export class LatestResultsModule {}
