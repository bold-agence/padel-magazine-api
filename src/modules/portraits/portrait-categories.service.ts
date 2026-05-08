import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PortraitCategory } from './entities/portrait-category.entity';
import { CreatePortraitCategoryDto } from './dto/create-portrait-category.dto';
import { UpdatePortraitCategoryDto } from './dto/update-portrait-category.dto';

@Injectable()
export class PortraitCategoriesService {
  constructor(
    @InjectRepository(PortraitCategory)
    private readonly repo: Repository<PortraitCategory>,
  ) {}

  async create(dto: CreatePortraitCategoryDto): Promise<PortraitCategory> {
    const existing = await this.repo.findOne({ where: { libelle: dto.libelle } });
    if (existing) {
      throw new ConflictException('Portrait category already exists');
    }
    return this.repo.save(this.repo.create(dto));
  }

  async findAll(): Promise<PortraitCategory[]> {
    return this.repo.find({ order: { libelle: 'ASC' } });
  }

  async findOne(id: string): Promise<PortraitCategory> {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Portrait category not found');
    }
    return category;
  }

  async update(id: string, dto: UpdatePortraitCategoryDto): Promise<PortraitCategory> {
    const category = await this.findOne(id);
    if (dto.libelle && dto.libelle !== category.libelle) {
      const existing = await this.repo.findOne({ where: { libelle: dto.libelle } });
      if (existing) {
        throw new ConflictException('Portrait category already exists');
      }
    }
    Object.assign(category, dto);
    return this.repo.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findOne(id);
    await this.repo.softRemove(category);
  }
}

