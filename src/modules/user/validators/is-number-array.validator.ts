/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-20 10:00:00
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-20 10:00:00
 * @FilePath: \nest-cursor\src\modules\user\validators\is-number-array.validator.ts
 * @Description: 数字数组验证器
 */
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * 验证字段必须是数字数组，不能是字符串
 * @param validationOptions 验证选项
 */
export function IsNumberArray(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNumberArray',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // 如果值为 undefined 或 null，由 @IsOptional() 处理
          if (value === undefined || value === null) {
            return true;
          }
          // 拒绝字符串类型
          if (typeof value === 'string') {
            return false;
          }
          // 必须是数组
          if (!Array.isArray(value)) {
            return false;
          }
          // 数组中的每个元素都必须是数字
          return value.every((item) => typeof item === 'number' && !isNaN(item));
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} 必须是数字数组，不能是字符串`;
        },
      },
    });
  };
}

