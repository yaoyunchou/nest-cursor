import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActionEntity } from './entities/user-action.entity';
import { CheckInDto, CheckInType } from './dto/check-in.dto';
import { UserActionRecordDto } from './dto/user-action-record.dto';

/**
 * 用户打卡服务
 * 负责处理用户打卡的业务逻辑
 */
@Injectable()
export class UserActionService {
  constructor(
    @InjectRepository(UserActionEntity)
    private readonly userActionRepository: Repository<UserActionEntity>,
  ) {}

  /**
   * 执行用户打卡
   * @param checkInDto 打卡数据
   * @returns 打卡记录DTO
   */
  async executeCheckIn(checkInDto: CheckInDto): Promise<UserActionRecordDto> {
    const { userId, type, checkInTime } = checkInDto;
    const date = checkInTime.split('T')[0];
    // 检查当天该时段是否已打卡
    const exist = await this.userActionRepository.findOne({
      where: { userId, type, date },
    });
    if (exist) {
      throw new BadRequestException('当天该时段已打卡');
    }
    const record = this.userActionRepository.create({
      userId,
      type,
      checkInTime,
      date,
    });
    const saved = await this.userActionRepository.save(record);
    return this.toRecordDto(saved);
  }

  /**
   * 查询用户打卡记录
   * @param params 查询参数
   * @returns 打卡记录DTO数组
   */
  async getRecords(params: { userId: string; date?: string }): Promise<UserActionRecordDto[]> {
    const where: Record<string, any> = { userId: params.userId };
    if (params.date) where.date = params.date;
    const records = await this.userActionRepository.find({ where });
    return records.map(r => this.toRecordDto(r));
  }

  /**
   * 实体转DTO
   * @param entity 用户打卡记录实体
   * @returns 打卡记录DTO
   */
  private toRecordDto(entity: UserActionEntity): UserActionRecordDto {
    return {
      userId: entity.userId,
      type: entity.type,
      checkInTime: entity.checkInTime,
      date: entity.date,
    };
  }
} 