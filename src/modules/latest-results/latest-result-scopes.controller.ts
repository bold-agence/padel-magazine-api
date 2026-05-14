import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateLatestResultScopeDto } from './dto/create-latest-result-scope.dto';
import { UpdateLatestResultScopeDto } from './dto/update-latest-result-scope.dto';
import { LatestResultsService } from './latest-results.service';

@Controller('latest-result-scopes')
export class LatestResultScopesController {
  constructor(private readonly latestResultsService: LatestResultsService) {}

  @Get()
  findActive() {
    return this.latestResultsService.findActiveScopes();
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin')
  findAllForAdmin() {
    return this.latestResultsService.findAllScopesForAdmin();
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateLatestResultScopeDto) {
    return this.latestResultsService.createScope(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLatestResultScopeDto) {
    return this.latestResultsService.updateScope(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.latestResultsService.removeScope(id);
  }
}
