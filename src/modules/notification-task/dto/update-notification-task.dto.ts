/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-23
 * @Description: 更新通知任务DTO
 */
import { PartialType } from '@nestjs/swagger';
import { CreateNotificationTaskDto } from './create-notification-task.dto';

/**
 * 更新通知任务DTO
 */
export class UpdateNotificationTaskDto extends PartialType(CreateNotificationTaskDto) {}
