import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TournamentCategoriesService } from './tournament-categories.service';
import { CreateTournamentCategoryDto } from './dto/create-tournament-category.dto';
import { UpdateTournamentCategoryDto } from './dto/update-tournament-category.dto';

@Controller('tournament-categories')
export class TournamentCategoriesController {
  constructor(
    private readonly tournamentCategoriesService: TournamentCategoriesService,
  ) {}

  @Get()
  findAll(@Query('tournamentId') tournamentId?: string) {
    return this.tournamentCategoriesService.findAll({ tournamentId });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tournamentCategoriesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateTournamentCategoryDto) {
    return this.tournamentCategoriesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTournamentCategoryDto,
  ) {
    return this.tournamentCategoriesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tournamentCategoriesService.remove(id);
  }
}
