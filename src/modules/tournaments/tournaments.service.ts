import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tournament } from './entities/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';

@Injectable()
export class TournamentsService {
  private readonly logger = new Logger(TournamentsService.name);

  constructor(
    @InjectRepository(Tournament)
    private readonly repo: Repository<Tournament>,
  ) {}

  async create(dto: CreateTournamentDto): Promise<Tournament> {
    const existing = await this.repo.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException('Tournament slug already exists');
    }
    const tournament = this.repo.create(dto);
    const saved = await this.repo.save(tournament);
    this.logger.log(`Tournament created (id=${saved.id}, slug=${saved.slug})`);
    return saved;
  }

  async findAll(): Promise<Tournament[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Tournament> {
    const tournament = await this.repo.findOne({ where: { id } });
    if (!tournament) {
      throw new NotFoundException('Tournament not found');
    }
    return tournament;
  }

  async update(id: string, dto: UpdateTournamentDto): Promise<Tournament> {
    const tournament = await this.findOne(id);

    if (dto.slug && dto.slug !== tournament.slug) {
      const existing = await this.repo.findOne({ where: { slug: dto.slug } });
      if (existing) {
        throw new ConflictException('Tournament slug already exists');
      }
    }

    Object.assign(tournament, dto);
    const saved = await this.repo.save(tournament);
    this.logger.log(`Tournament updated (id=${saved.id}, slug=${saved.slug})`);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const tournament = await this.findOne(id);
    await this.repo.softRemove(tournament);
    this.logger.log(`Tournament removed (id=${id})`);
  }
}
