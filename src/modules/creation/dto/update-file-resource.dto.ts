import { PartialType } from '@nestjs/mapped-types';
import { CreateFileResourceDto } from './create-file-resource.dto';

/**
 * 更新图片资源DTO
 */
export class UpdateFileResourceDto extends PartialType(CreateFileResourceDto) {} 