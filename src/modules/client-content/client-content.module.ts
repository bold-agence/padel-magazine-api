import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinioModule } from '../minio/minio.module';
import { ClientContentController } from './client-content.controller';
import { ClientContentService } from './client-content.service';
import { AdImage } from './entities/ad-image.entity';
import { BreakingNews } from './entities/breaking-news.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BreakingNews, AdImage]), MinioModule],
  controllers: [ClientContentController],
  providers: [ClientContentService],
  exports: [ClientContentService],
})
export class ClientContentModule {}
