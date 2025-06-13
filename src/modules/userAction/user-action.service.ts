import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserActionEntity } from './entities/user-action.entity';
import { CheckInDto, CheckInType } from './dto/check-in.dto';
import { UserActionRecordDto } from './dto/user-action-record.dto';
const dayjs = require('dayjs')


interface ListResponse<T> {
  total: number;
  page: number;
  pageSize: number;
  list: T;
}


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
   * 查询用户打卡记录, 这里需要查询所有的打卡记录
   * 如果date为空，则查询所有日期
   * 如果date不为空，则查询该日期
   * @param params 查询参数
   * @param params.userId 用户ID 可选
   * @param params.date 日期 可选
   * @returns 打卡记录DTO数组
   */
  async getRecords(params: { userId: string; date?: string, page?: number, pageSize?: number }): Promise<ListResponse<UserActionRecordDto[]>> {
    const { userId, date, page, pageSize } = params;
    const format = 'YYYY-MM-DD';
    // 根据传入的参数组装查询条件， this.userActionRepository.findAll
    const where: Record<string, any> = {};
    if (userId) where.userId = userId;
    if (date) where.date = date;
    const records = await this.userActionRepository.find({ where });
    const result = records.map(r => this.toRecordDto(r));
    // totoal 总记录数, page, pageSize, data: result
    return {
    
      total: records.length,  
      page: page || 1,
      pageSize: pageSize || 10, 
      list: result
    }
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