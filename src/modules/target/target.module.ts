import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetController } from './target.controller';
import { TargetService } from './target.service';
import { Target } from './entities/target.entity';
import { Task } from './entities/task.entity';
import { TargetTaskController } from './targetTask.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Target, Task])],
  controllers: [TargetController, TargetTaskController],
  providers: [TargetService],
  exports: [TargetService],
})
export class TargetModule {} 