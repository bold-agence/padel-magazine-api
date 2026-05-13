import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateLatestResultDto } from './dto/create-latest-result.dto';
import { UpdateLatestResultDto } from './dto/update-latest-result.dto';
import { LatestResultsService } from './latest-results.service';

@Controller('latest-results')
export class LatestResultsController {
  constructor(private readonly latestResultsService: LatestResultsService) {}

  @Get()
  findPaginated(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(8), ParseIntPipe) limit: number,
    @Query('category', new DefaultValuePipe('all')) category: string,
  ) {
    return this.latestResultsService.findPaginated(page, limit, category, false);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  findAllForAdmin() {
    return this.latestResultsService.findAllForAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateLatestResultDto) {
    return this.latestResultsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLatestResultDto) {
    return this.latestResultsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.latestResultsService.remove(id);
  }
}
