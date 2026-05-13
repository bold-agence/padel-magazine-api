import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Live } from './entities/live.entity';
import { LiveChannelSettings } from './entities/live-channel-settings.entity';
import { LivesController } from './lives.controller';
import { LivesService } from './lives.service';
import { Event } from '../events/entities/event.entity';
import { MinioModule } from '../minio/minio.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Live, LiveChannelSettings, Event]),
    MinioModule,
  ],
  controllers: [LivesController],
  providers: [LivesService],
  exports: [LivesService],
})
export class LivesModule {}
