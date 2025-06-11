import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActionEntity } from './entities/user-action.entity';
import { CheckInDto, CheckInType } from './dto/check-in.dto';
import { UserActionRecordDto } from './dto/user-action-record.dto';
const dayjs = require('dayjs')

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
    console.log(checkInTime);
    const format = 'YYYY-MM-DD';
    const date =  dayjs(checkInTime).format(format);
    // 判断date是否是今天
    const today = dayjs().format(format);
    if (date !== today) {
      throw new BadRequestException('打卡日期不是今天，打卡失败！');
    }
    // 检查当天该时段是否已打卡
    const exist = await this.userActionRepository.findOne({
      where: { userId, type, date },
    });

    // 获取上一个打卡记录
    const previousRecords = await this.userActionRepository.findOne({
      where: { userId, type, date: dayjs(date).subtract(1, 'day').format(format) },
    });
    let continuousCheckInCount = 1;
    if(previousRecords) {
      continuousCheckInCount = previousRecords.continuousCheckInCount + 1;
    }
    if (exist) {
      // 当前打卡时间是否连续， 例如今天打卡日期是 06-11， 那么需要看6-11之前有多少个打卡记录， 并且日期还需要是联系的
      return this.toRecordDto(exist);
    }
    const record = this.userActionRepository.create({
      userId,
      type,
      checkInTime,
      date,
      continuousCheckInCount,
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
      checkInTime: dayjs(entity.checkInTime).format('YYYY-MM-DD HH:mm:ss'),
      date: dayjs(entity.date).format('YYYY-MM-DD'),
      continuousCheckInCount:entity.continuousCheckInCount
    };
  }
} 