import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetController } from './target.controller';
import { TargetService } from './target.service';
import { Target } from './entities/target.entity';
import { Task } from './entities/task.entity';
import { TargetTaskController } from './targetTask.controller';
import { User } from '../user/entities/user.entity';
import { ErrorBook } from '../errorbook/entities/errorbook.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Target, Task, User, ErrorBook])],
  controllers: [TargetController, TargetTaskController],
  providers: [TargetService],
  exports: [TargetService],
})
export class TargetModule {} 