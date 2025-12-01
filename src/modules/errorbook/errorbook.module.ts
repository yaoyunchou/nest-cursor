import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ErrorBookController } from './errorbook.controller';
import { ErrorBookService } from './errorbook.service';
import { ErrorBook } from './entities/errorbook.entity';
import { User } from '../user/entities/user.entity';

/**
 * 错题本模块
 */
@Module({
  imports: [TypeOrmModule.forFeature([ErrorBook, User])],
  controllers: [ErrorBookController],
  providers: [ErrorBookService],
  exports: [ErrorBookService],
})
export class ErrorBookModule {}

