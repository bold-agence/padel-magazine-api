import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VideoType } from './entities/video-type.entity';
import { Video } from './entities/video.entity';
import { VideoTypesService } from './video-types.service';
import { VideosService } from './videos.service';
import { VideoTypesController } from './video-types.controller';
import { VideosController } from './videos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VideoType, Video])],
  controllers: [VideoTypesController, VideosController],
  providers: [VideoTypesService, VideosService],
  exports: [VideoTypesService, VideosService],
})
export class VideosModule {}
