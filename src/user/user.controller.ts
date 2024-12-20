import { Controller, Get,Post, Body,Inject, Query} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './RegisterUserDto';
import { EmailService } from '../email/email.service';
import { RedisService } from 'src/redis/redis.service';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() registerUser: RegisterUserDto){
    return await this.userService.register(registerUser);
  }

  @Inject(EmailService)
  private emailService: EmailService;

  @Inject(RedisService)
  private redisService: RedisService;

  @Get('register-captcha')
  async captcha(@Query('address') address: string){
    const code = Math.random().toString().slice(2,8);
    await this.redisService.set(`captcha_${address}`, code, 5 * 60);

    await this.emailService.sendMail({
      to: address,
      subject: '注册验证码',
      html: `您的验证码是：${code}`
    });

    return '发送成功'
  }

  @Get('init-data')
  async initData(){
    await this.userService.initData();
    return 'done';
  }

  @Inject(JwtService)
  private jwtService: JwtService;

  @Inject(ConfigService)
  private configService: ConfigService;
  @Post('login')
  async userLogin(@Body() loginUser: LoginUserDto){
    const vo = await this.userService.login(loginUser, false);
    vo.accessToken = this.jwtService.sign({
      userId: vo.userInfo.id,
      username: vo.userInfo.username,
      roles: vo.userInfo.roles,
      permissions: vo.userInfo.permissions
    },{
      expiresIn: this.configService.get('jwt_access_token_expire_time') || '30m'
    })

    vo.refreshToken = this.jwtService.sign({
      userId: vo.userInfo.id,
    },{
      expiresIn: this.configService.get('jwt_refresh_token_expire_time') || '30m'
    })
    return vo;
  }

  @Post('admin/login')
  async adminLogin(@Body() loginUser: LoginUserDto){
    const vo = await this.userService.login(loginUser, true);
    return vo;
  }
}
