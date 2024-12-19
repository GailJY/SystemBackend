import { HttpException, Inject,Injectable, Logger,HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './RegisterUserDto';
import { User } from './entities/user.entity';
import { RedisService } from '../redis/redis.service';


@Injectable()
export class UserService {
    private logger = new Logger();
    

    @InjectRepository(User)
    private userRepository: Repository<User>;

    @Inject(RedisService)
    private redisService: RedisService;
    async register(user: RegisterUserDto){
        const captcha = await this.redisService.get(`captcha:${user.email}`);

        if(!captcha){
            throw new HttpException('验证码已过期',HttpStatus.BAD_REQUEST);
        }

        if(user.captcha !== captcha){
            throw new HttpException('验证码错误',HttpStatus.BAD_REQUEST);
        }

        const foundUser = await this.userRepository.findOneBy({
            username: user.username
        })

        if(foundUser){
            throw new HttpException('用户名已被占用',HttpStatus.BAD_REQUEST);
        }

        const newUser = new User();
        newUser.username = user.username;
        newUser.password = user.password;
        newUser.nickName = user.nickname;
        newUser.email = user.email;

        try{
            await this.userRepository.save(newUser);
            return 'register success';
        }catch(e){
            this.logger.error(e, UserService);
            return 'register failed';
        }
    }
}
