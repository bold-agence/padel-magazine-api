import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventTagDto } from './dto/create-event-tag.dto';
import { UpdateEventTagDto } from './dto/update-event-tag.dto';
import { EventTag } from './entities/event-tag.entity';

@Injectable()
export class EventTagsService {
  constructor(
    @InjectRepository(EventTag)
    private readonly tagsRepo: Repository<EventTag>,
  ) {}

  async create(dto: CreateEventTagDto): Promise<EventTag> {
    const name = dto.name.trim();
    const existing = await this.tagsRepo.findOne({ where: { name } });
    if (existing) {
      throw new ConflictException('Event tag already exists');
    }
    return this.tagsRepo.save(this.tagsRepo.create({ name }));
  }

  async findAll(): Promise<EventTag[]> {
    return this.tagsRepo.find({
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<EventTag> {
    const tag = await this.tagsRepo.findOne({ where: { id } });
    if (!tag) {
      throw new NotFoundException('Event tag not found');
    }
    return tag;
  }

  async update(id: string, dto: UpdateEventTagDto): Promise<EventTag> {
    const tag = await this.findOne(id);

    if (dto.name !== undefined) {
      const name = dto.name.trim();
      if (name !== tag.name) {
        const existing = await this.tagsRepo.findOne({ where: { name } });
        if (existing) {
          throw new ConflictException('Event tag already exists');
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
