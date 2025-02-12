import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { LowcodeController } from './lowcode.controller';
import { LowcodeService } from './lowcode.service';
import { Page } from './entities/page.entity';
import { PageVersion } from './entities/page-version.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Page, PageVersion]),
    ScheduleModule.forRoot(),
  ],
  controllers: [LowcodeController],
  providers: [LowcodeService],
  exports: [LowcodeService],
})
export class LowcodeModule {} 