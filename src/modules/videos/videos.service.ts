import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './entities/video.entity';
import { VideoType } from './entities/video-type.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Injectable()
export class VideosService {
  constructor(
    @InjectRepository(Video)
    private readonly videosRepo: Repository<Video>,
    @InjectRepository(VideoType)
    private readonly typesRepo: Repository<VideoType>,
  ) {}

  findAll(videoTypeId?: string): Promise<Video[]> {
    const qb = this.videosRepo
      .createQueryBuilder('v')
      .leftJoinAndSelect('v.videoType', 't')
      .orderBy('v.createdAt', 'DESC');
    if (videoTypeId?.trim()) {
      qb.andWhere('t.id = :videoTypeId', { videoTypeId: videoTypeId.trim() });
    }
    return qb.getMany();
  }

  async findOne(id: string): Promise<Video> {
    const row = await this.videosRepo.findOne({
      where: { id },
      relations: { videoType: true },
    });
    if (!row) throw new NotFoundException('Vidéo introuvable');
    return row;
  }

  async create(dto: CreateVideoDto): Promise<Video> {
    const type = await this.typesRepo.findOne({ where: { id: dto.videoTypeId } });
    if (!type) throw new BadRequestException('Type de vidéo invalide');
    const entity = this.videosRepo.create({
      title: dto.title.trim(),
      youtubeLink: dto.youtubeLink.trim(),
      videoType: type,
    });
    return this.videosRepo.save(entity);
  }

  async update(id: string, dto: UpdateVideoDto): Promise<Video> {
    const row = await this.findOne(id);
    if (dto.title !== undefined) row.title = dto.title.trim();
    if (dto.youtubeLink !== undefined) row.youtubeLink = dto.youtubeLink.trim();
    if (dto.videoTypeId !== undefined) {
      const type = await this.typesRepo.findOne({ where: { id: dto.videoTypeId } });
      if (!type) throw new BadRequestException('Type de vidéo invalide');
      row.videoType = type;
    }
    return this.videosRepo.save(row);
  }

  async remove(id: string): Promise<void> {
    const res = await this.videosRepo.delete({ id });
    if (!res.affected) throw new NotFoundException('Vidéo introuvable');
  }
}
