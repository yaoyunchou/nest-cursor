/**
 * @description: JWT用户信息DTO
 */
export class JwtUserDto {
    /** 用户角色列表 */
    roles: string[];
  
    /** 用户ID */
    userId: number;
  
    /** 用户名 */
    username: string;
  }