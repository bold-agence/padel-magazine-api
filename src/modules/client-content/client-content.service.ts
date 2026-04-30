import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { MinioService } from '../minio/minio.service';
import { CreateAdImageDto } from './dto/create-ad-image.dto';
import { CreateBreakingNewsDto } from './dto/create-breaking-news.dto';
import { UpdateAdImageDto } from './dto/update-ad-image.dto';
import { UpdateBreakingNewsDto } from './dto/update-breaking-news.dto';
import { AdImage, AdSlot } from './entities/ad-image.entity';
import { BreakingNews } from './entities/breaking-news.entity';

@Injectable()
export class ClientContentService {
  constructor(
    @InjectRepository(BreakingNews)
    private readonly breakingNewsRepo: Repository<BreakingNews>,
    @InjectRepository(AdImage)
    private readonly adImageRepo: Repository<AdImage>,
    private readonly minioService: MinioService,
  ) {}

  async uploadAdImage(file: Express.Multer.File): Promise<string> {
    return this.minioService.uploadFile(file, 'ads');
  }

  async createBreakingNews(dto: CreateBreakingNewsDto): Promise<BreakingNews> {
    const item = this.breakingNewsRepo.create({
      title: dto.title,
      linkUrl: dto.linkUrl,
      isActive: dto.isActive ?? true,
      displayOrder: dto.displayOrder ?? 0,
    });
    return this.breakingNewsRepo.save(item);
  }

  async findAllBreakingNews(activeOnly = false): Promise<BreakingNews[]> {
    return this.breakingNewsRepo.find({
      where: activeOnly ? { isActive: true } : {},
      order: { displayOrder: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOneBreakingNews(id: string): Promise<BreakingNews> {
    const item = await this.breakingNewsRepo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Breaking news not found');
    }
    return item;
  }

  async updateBreakingNews(
    id: string,
    dto: UpdateBreakingNewsDto,
  ): Promise<BreakingNews> {
    const item = await this.findOneBreakingNews(id);
    Object.assign(item, dto);
    return this.breakingNewsRepo.save(item);
  }

  async removeBreakingNews(id: string): Promise<void> {
    const item = await this.findOneBreakingNews(id);
    await this.breakingNewsRepo.softRemove(item);
  }

  async createAdImage(dto: CreateAdImageDto): Promise<AdImage> {
    const existing = await this.adImageRepo.findOne({ where: { slot: dto.slot } });
    if (existing) {
      throw new ConflictException('This ad slot is already used');
    }
    const item = this.adImageRepo.create({
      title: dto.title,
      slot: dto.slot,
      imageUrl: dto.imageUrl,
      targetUrl: dto.targetUrl,
      isActive: dto.isActive ?? true,
    });
    return this.adImageRepo.save(item);
  }

  async findAllAdImages(
    slot?: AdSlot,
    activeOnly = false,
  ): Promise<AdImage[]> {
    const where: FindOptionsWhere<AdImage> = {};
    if (slot) {
      where.slot = slot;
    }
    if (activeOnly) {
      where.isActive = true;
    }
    return this.adImageRepo.find({
      where,
      order: { slot: 'ASC', createdAt: 'DESC' },
    });
  }

  async findOneAdImage(id: string): Promise<AdImage> {
    const item = await this.adImageRepo.findOne({ where: { id } });
    if (!item) {
      throw new NotFoundException('Ad image not found');
    }
    return item;
  }

  async updateAdImage(id: string, dto: UpdateAdImageDto): Promise<AdImage> {
    const item = await this.findOneAdImage(id);
    if (dto.slot && dto.slot !== item.slot) {
      const existing = await this.adImageRepo.findOne({ where: { slot: dto.slot } });
      if (existing && existing.id !== item.id) {
        throw new ConflictException('This ad slot is already used');
      }
    }
    Object.assign(item, dto);
    return this.adImageRepo.save(item);
  }

  async removeAdImage(id: string): Promise<void> {
    const item = await this.findOneAdImage(id);
    await this.adImageRepo.softRemove(item);
  }
}
