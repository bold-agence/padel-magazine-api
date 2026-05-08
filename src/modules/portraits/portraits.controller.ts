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
import { PortraitsService } from './portraits.service';
import { CreatePortraitDto } from './dto/create-portrait.dto';
import { UpdatePortraitDto } from './dto/update-portrait.dto';

@Controller('portraits')
export class PortraitsController {
  constructor(private readonly portraitsService: PortraitsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePortraitDto) {
    return this.portraitsService.create(dto);
  }

  @Get()
  findAll() {
    return this.portraitsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.portraitsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePortraitDto) {
    return this.portraitsService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.portraitsService.remove(id);
  }
}

