import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portrait } from './entities/portrait.entity';
import { PortraitCategory } from './entities/portrait-category.entity';
import { PortraitsService } from './portraits.service';
import { PortraitCategoriesService } from './portrait-categories.service';
import { PortraitsController } from './portraits.controller';
import { PortraitCategoriesController } from './portrait-categories.controller';
import { Player } from '../players/entities/player.entity';
import { Article } from '../articles/entities/article.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Portrait, PortraitCategory, Player, Article]),
  ],
  controllers: [PortraitsController, PortraitCategoriesController],
  providers: [PortraitsService, PortraitCategoriesService],
  exports: [PortraitsService, PortraitCategoriesService],
})
export class PortraitsModule {}

