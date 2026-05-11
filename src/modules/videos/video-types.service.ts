import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VideoType } from './entities/video-type.entity';
import { CreateVideoTypeDto } from './dto/create-video-type.dto';
import { UpdateVideoTypeDto } from './dto/update-video-type.dto';

@Injectable()
export class VideoTypesService {
  constructor(
    @InjectRepository(VideoType)
    private readonly repo: Repository<VideoType>,
  ) {}

  findAll(): Promise<VideoType[]> {
    return this.repo.find({ order: { title: 'ASC' } });
  }

  async findOne(id: string): Promise<VideoType> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Type de vidéo introuvable');
    return row;
  }

  async create(dto: CreateVideoTypeDto): Promise<VideoType> {
    const title = dto.title.trim();
    const exists = await this.repo.exist({ where: { title } });
    if (exists) throw new ConflictException('Ce titre existe déjà');
    const entity = this.repo.create({ title });
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateVideoTypeDto): Promise<VideoType> {
    const row = await this.findOne(id);
    if (dto.title !== undefined) {
      const title = dto.title.trim();
      const taken = await this.repo.findOne({ where: { title } });
      if (taken && taken.id !== id) {
        throw new ConflictException('Ce titre existe déjà');
      }
      row.title = title;
    }
    return this.repo.save(row);
  }

  async remove(id: string): Promise<void> {
    const res = await this.repo.delete({ id });
    if (!res.affected) throw new NotFoundException('Type de vidéo introuvable');
  }
}
