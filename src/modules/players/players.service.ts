import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { MinioService } from '../minio/minio.service';
import { Club } from '../clubs/entities/club.entity';

@Injectable()
export class PlayersService {
  private readonly logger = new Logger(PlayersService.name);

  constructor(
    @InjectRepository(Player)
    private readonly repo: Repository<Player>,
    @InjectRepository(Club)
    private readonly clubsRepo: Repository<Club>,
    private readonly minioService: MinioService,
  ) {}

  async create(dto: CreatePlayerDto, file?: Express.Multer.File): Promise<Player> {
    this.logger.log(
      `Creating player (slug=${dto.slug}, name=${dto.name}, hasPhoto=${!!file})`,
    );

    const existing = await this.repo.findOne({
      where: { slug: dto.slug },
    });

    if (existing) {
      this.logger.warn(`Create player blocked: slug already exists (${dto.slug})`);
      throw new ConflictException('Slug already exists');
    }

    let profilePhotoUrl: string | undefined;

    if (file) {
      this.logger.debug(`Uploading profile photo for slug=${dto.slug}`);
      profilePhotoUrl = await this.minioService.uploadFile(file, 'players');
      this.logger.debug(
        `Profile photo uploaded for slug=${dto.slug} (url=${profilePhotoUrl})`,
      );
    }

    let club: Club | null | undefined;
    if (dto.clubId) {
      club = await this.clubsRepo.findOne({ where: { id: dto.clubId } });
      if (!club) {
        throw new NotFoundException('Club not found');
      }
    }

    const player = this.repo.create({
      slug: dto.slug,
      name: dto.name,
      nationality: dto.nationality,
      profilePhoto: profilePhotoUrl,
      club: club ?? null,
    });
    const savedPlayer = await this.repo.save(player);
    this.logger.log(
      `Player created successfully (id=${savedPlayer.id}, slug=${savedPlayer.slug})`,
    );
    const reloaded = await this.repo.findOne({
      where: { id: savedPlayer.id },
      relations: { club: true },
    });
    return reloaded ?? savedPlayer;
  }

  async findAll(): Promise<Player[]> {
    return this.repo.find({ relations: { club: true }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<Player> {
    const player = await this.repo.findOne({
      where: { id },
      relations: { club: true },
    });
    if (!player) {
      throw new NotFoundException('Player not found');
    }

    return player;
  }

  async update(
    id: string,
    dto: UpdatePlayerDto,
    file?: Express.Multer.File,
  ): Promise<Player> {
    this.logger.log(
      `Updating player (id=${id}, hasPhoto=${!!file}, removeProfilePhoto=${dto.removeProfilePhoto})`,
    );
    const player = await this.findOne(id);

    if (dto.slug && dto.slug !== player.slug) {
      const existing = await this.repo.findOne({
        where: { slug: dto.slug },
      });

      if (existing) {
        throw new ConflictException('Slug already exists');
      }
    }

    const shouldRemovePhoto = dto.removeProfilePhoto === 'true';

    if (file) {
      this.logger.debug(`Uploading new profile photo for player id=${id}`);
      dto.profilePhoto = await this.minioService.uploadFile(file, 'players');
      this.logger.debug(
        `New profile photo uploaded for player id=${id} (url=${dto.profilePhoto})`,
      );
    } else if (shouldRemovePhoto) {
      this.logger.debug(`Removing profile photo for player id=${id}`);
      dto.profilePhoto = null;
    }

    if (dto.clubId !== undefined) {
      if (dto.clubId === null) {
        player.club = null;
      } else {
        const club = await this.clubsRepo.findOne({ where: { id: dto.clubId } });
        if (!club) {
          throw new NotFoundException('Club not found');
        }
        player.club = club;
      }
      delete (dto as unknown as { clubId?: string | null }).clubId;
    }

    delete dto.removeProfilePhoto;
    Object.assign(player, dto);
    const updated = await this.repo.save(player);
    this.logger.log(
      `Player updated successfully (id=${updated.id}, slug=${updated.slug})`,
    );
    const reloaded = await this.repo.findOne({
      where: { id: updated.id },
      relations: { club: true },
    });
    return reloaded ?? updated;
  }

  async remove(id: string): Promise<void> {
    const player = await this.findOne(id);
    await this.repo.softRemove(player);
  }
}
