import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('players')
export class PlayersController {
  private readonly logger = new Logger(PlayersController.name);

  constructor(private readonly playersService: PlayersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FileInterceptor('profilePhoto'))
  create(
    @Body() dto: CreatePlayerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.log(
      `POST /players - create requested (slug=${dto.slug}, hasPhoto=${!!file})`,
    );
    if (file) {
      this.logger.debug(
        `POST /players - uploaded file received (name=${file.originalname}, size=${file.size}, type=${file.mimetype})`,
      );
    }
    return this.playersService.create(dto, file);
  }

  @Get()
  findAll() {
    return this.playersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @UseInterceptors(FileInterceptor('profilePhoto'))
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePlayerDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    this.logger.log(
      `PATCH /players/${id} - update requested (hasPhoto=${!!file}, removeProfilePhoto=${dto.removeProfilePhoto})`,
    );
    if (file) {
      this.logger.debug(
        `PATCH /players/${id} - uploaded file received (name=${file.originalname}, size=${file.size}, type=${file.mimetype})`,
      );
    }
    return this.playersService.update(id, dto, file);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playersService.remove(id);
  }
}
