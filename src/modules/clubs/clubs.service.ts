import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Club } from './entities/club.entity';
import { CreateClubDto } from './dto/create-club.dto';
import { UpdateClubDto } from './dto/update-club.dto';

@Injectable()
export class ClubsService {
  private readonly logger = new Logger(ClubsService.name);

  constructor(
    @InjectRepository(Club)
    private readonly repo: Repository<Club>,
  ) {}

  async create(dto: CreateClubDto): Promise<Club> {
    const existing = await this.repo.findOne({ where: { title: dto.title } });
    if (existing) {
      throw new ConflictException('Club title already exists');
    }
    const club = this.repo.create(dto);
    const saved = await this.repo.save(club);
    this.logger.log(`Club created (id=${saved.id})`);
    return saved;
  }

  async findAll(): Promise<Club[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Club> {
    const club = await this.repo.findOne({ where: { id } });
    if (!club) {
      throw new NotFoundException('Club not found');
    }
    return club;
  }

  async update(id: string, dto: UpdateClubDto): Promise<Club> {
    const club = await this.findOne(id);
    if (dto.title && dto.title !== club.title) {
      const existing = await this.repo.findOne({ where: { title: dto.title } });
      if (existing) {
        throw new ConflictException('Club title already exists');
      }
    }
    Object.assign(club, dto);
    return this.repo.save(club);
  }

  async remove(id: string): Promise<void> {
    const club = await this.findOne(id);
    await this.repo.softRemove(club);
  }
}

