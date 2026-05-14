import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinioModule } from '../minio/minio.module';
import { Classement } from './entities/classement.entity';
import { ClassementLine } from './entities/classement-line.entity';
import { ClassementsService } from './classements.service';
import { ClassementsController } from './classements.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Classement, ClassementLine]), MinioModule],
  controllers: [ClassementsController],
  providers: [ClassementsService],
  exports: [ClassementsService],
})
export class ClassementsModule {}
