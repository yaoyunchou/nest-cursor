import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TargetService } from './target.service';
import { CreateTargetDto } from './dto/create-target.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('目标')
@Controller('targets')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TargetController {
  constructor(private readonly targetService: TargetService) {}

  @Post()
  @ApiOperation({ summary: '创建目标' })
  create(@Body() createTargetDto: CreateTargetDto) {
    return this.targetService.create(createTargetDto);
  }

  @Get()
  @ApiOperation({ summary: '获取所有目标' })
  findAll() {
    return this.targetService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取指定目标' })
  findOne(@Param('id') id: string) {
    return this.targetService.findOne(+id);
  }
} 