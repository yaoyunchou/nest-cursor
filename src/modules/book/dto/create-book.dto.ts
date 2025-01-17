/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-14 14:45:51
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-14 14:56:00
 * @FilePath: \nest-cursor\src\book\dto\create-book.dto.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-14 14:45:51
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-14 14:55:06
 * @FilePath: \nest-cursor\src\book\dto\create-book.dto.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */

import { IsNotEmpty, IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty({ message: '标题不能为空' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: '作者不能为空' })
  @IsString()
  author: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUrl({}, { message: '封面图片必须是有效的URL地址' })
  @IsOptional()
  coverImage?: string;
} 