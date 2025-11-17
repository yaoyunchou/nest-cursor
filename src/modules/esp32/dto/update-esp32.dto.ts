/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-18 20:00:00
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-18 20:00:00
 * @FilePath: \nest-cursor\src\modules\esp32\dto\update-esp32.dto.ts
 * @Description: 更新ESP32芯片DTO
 */
import { PartialType } from '@nestjs/swagger';
import { CreateEsp32Dto } from './create-esp32.dto';

export class UpdateEsp32Dto extends PartialType(CreateEsp32Dto) {}

