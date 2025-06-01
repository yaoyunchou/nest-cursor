/*
 * @Author: yaoyc yaoyunchou@bananain.com
 * @Date: 2025-01-14 15:09:10
 * @LastEditors: yaoyc yaoyunchou@bananain.com
 * @LastEditTime: 2025-01-15 10:44:21
 * @FilePath: \nest-cursor\src\auth\auth.service.ts
 * @Description: 认证服务
 */
import { Injectable, UnauthorizedException, ConflictException, HttpException, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { RedisService } from '@/core/services/redis/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByUsername(loginDto.username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const roles = await this.userService.getUserRoles(user.id);
    const payload = { 
      sub: user.id, 
      username: user.username,
      roles: roles
    };

    return {
      access_token: this.jwtService.sign(payload, { secret: process.env.SECRET }),
      user: {
        id: user.id,
        username: user.username,
        roles: roles
      }
    };
  }

  async register(registerDto: CreateUserDto) {
    const existingUser = await this.userService.findByUsername(registerDto.username);
    if (existingUser) {
      throw new ConflictException('用户名已存在');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userService.create({
      ...registerDto,
      password: hashedPassword,
    });

    return {
      message: '注册成功',
      userId: user.id,
    };
  }

  /**
   *  这个接口有两个功能
   * 1. 根据code返回对应的数据，如果用户没有注册过，则判断是否传入了头像和用户名， 没有则直击返回用户信息为null
   * 2. 如果用户没有注册过，还传入了用户名和头像， 则新增用户， 默认角色为用户， 而且必须传入用户名和头像， 完成后返回用户信息和token
   * 3. 如果用户已经注册过，则实现静默登录的逻辑， 返回用户信息和token
   * @param wechatLoginDto 
   * @returns 
   */
  async wechatLogin(wechatLoginDto: WechatLoginDto) {
    try {
      const { code, username, avatar, phone } = wechatLoginDto;
      const wxAppid = process.env.WECHAT_APP_ID;
      const wxSecret = process.env.WECHAT_APP_SECRET;
      const secret = process.env.SECRET;

      const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${wxAppid}&secret=${wxSecret}&js_code=${code}&grant_type=authorization_code`;
      
      const response = await fetch(url);
      const data = await response.json();
      const { openid, errmsg, errcode, session_key  } = data;

      if (errcode) {
        throw new HttpException(`微信登录失败: ${errmsg}`, HttpStatus.UNAUTHORIZED);
      }

      // 查找或创建用户
      let user = await this.userService.findByOpenid(openid);

      if (!user) {
        // 创建新用户
        if (!username || !avatar) {
          // 这里不能当错误执行， 这个场景对应第一个功能， 返回对应的信息即可
          return {
            message: '用户没有注册',
            data: null,
          };
        }
        user = await this.userService.create({
          openid,
          username: username || `wx_${openid.slice(-8)}`, // 生成一个默认用户名
          avatar: avatar || '',
          phone:phone ||'',
          password: '', // 微信用户无密码
        });
      }

      // 生成JWT token，  这里多存入openid 和 session_key会有影响吗
      
      const payload = { 
        sub: user.id,
        username: user.username,
      };
      // 将openid 和 session_key 存入redis
      await this.redisService.set(`openid:${user.id}`, openid, 3600);
      await this.redisService.set(`session_key:${user.id}`, session_key, 3600);
      return {
        token: this.jwtService.sign(payload, { secret  }),
        
        user: {
          id: user.id,
          session_key,
          avatar: user.avatar,
          phone: user.phone,
          username: user.username,
        }
      };
    } catch (error) {
      throw new HttpException(
        error.message || '微信登录失败',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  // 获取access_token  https://api.weixin.qq.com/cgi-bin/token
  async getAccessToken() {
    const wxAppid = process.env.WECHAT_APP_ID;
    const wxSecret = process.env.WECHAT_APP_SECRET;
    const grant_type = 'client_credential';

    const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=${grant_type}&appid=${wxAppid}&secret=${wxSecret}`;
    const response = await fetch(url);
    const data = await response.json();
    const { access_token, errmsg, errcode } = data;
    if (errcode) {
      throw new HttpException(`获取access_token失败: ${errmsg}`, HttpStatus.UNAUTHORIZED);
    }
    return access_token;
  }

  // 调用 获取用户手机号
  async getUserPhoneNumber(code: string, userId: number) {
    // 获取openid,判断redis
    const openid = await this.redisService.get(`openid:${userId}`);
    if (!openid) {
      throw new HttpException('用户未登录', HttpStatus.UNAUTHORIZED);
    }
    const access_token = await this.getAccessToken();
    const url = `https://api.weixin.qq.com/wxa/getphonenumber?access_token=${access_token}&code=${code}&openid=${openid}`;
    const response = await fetch(url);
    const data = await response.json();
    const { phone_number, errmsg, errcode } = data;
    if (errcode) {
      throw new HttpException(`获取用户手机号失败: ${errmsg}`, HttpStatus.UNAUTHORIZED);
    }
    // 同步手机号码到对应的用户信息中
    await this.userService.update(userId, { phone: phone_number });
    return phone_number;
  }
 
} 