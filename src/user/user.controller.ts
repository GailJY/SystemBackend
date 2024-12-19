import { Controller, Get,Post, Body,Inject, Query} from '@nestjs/common';
import { UserService } from './user.service';
import { RegisterUserDto } from './RegisterUserDto';
import { EmailService } from '../email/email.service';
import { RedisService } from 'src/redis/redis.service';

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

}
