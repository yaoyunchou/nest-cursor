import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { LowcodeController } from './lowcode.controller';
import { LowcodeService } from './lowcode.service';
import { Page } from './entities/page.entity';
import { PageVersion } from './entities/page-version.entity';
import { PageCache } from './entities/page-cache.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Page, PageVersion, PageCache]),
    ScheduleModule.forRoot(),
  ],
  controllers: [LowcodeController],
  providers: [LowcodeService],
  exports: [LowcodeService],
})
export class LowcodeModule {} 