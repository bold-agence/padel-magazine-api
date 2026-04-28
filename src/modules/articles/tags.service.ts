import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagsRepo: Repository<Tag>,
  ) {}

  async create(dto: CreateTagDto): Promise<Tag> {
    const name = dto.name.trim();
    const existing = await this.tagsRepo.findOne({ where: { name } });
    if (existing) {
      throw new ConflictException('Tag already exists');
    }
    return this.tagsRepo.save(this.tagsRepo.create({ name }));
  }

  async findAll(): Promise<Tag[]> {
    return this.tagsRepo.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Tag> {
    const tag = await this.tagsRepo.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Tag not found');
    }
    return tag;
  }

  async update(id: string, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.findOne(id);

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (name !== tag.name) {
        const existing = await this.tagsRepo.findOne({ where: { name } });
        if (existing) {
          throw new ConflictException('Tag already exists');
        }
      }
      tag.name = name;
    }

    return this.tagsRepo.save(tag);
  }

  async remove(id: string): Promise<void> {
    const tag = await this.findOne(id);
    await this.tagsRepo.softRemove(tag);
  }
}
