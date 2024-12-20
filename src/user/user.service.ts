import { HttpException, Inject,Injectable, Logger,HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './RegisterUserDto';
import { User } from './entities/user.entity';
import { RedisService } from '../redis/redis.service';
import { md5 } from '../utils';
import { Role } from './entities/role.entity';
import { Permission } from './entities/permission.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginUserVo } from './vo/login-user.vo';


@Injectable()
export class UserService {
    private logger = new Logger();
    

    @InjectRepository(User)
    private userRepository: Repository<User>;

    @InjectRepository(Role)
    private roleRepository: Repository<Role>;

    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>;

    @Inject(RedisService)
    private redisService: RedisService;
    async register(user: RegisterUserDto){
        const captcha = await this.redisService.get(`${user.email}`);

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
        newUser.password = md5(user.password);
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


    async initData(){
        const user1 = new User();
        user1.username = 'admin';
        user1.password = '123456';
        user1.email = 'admin@qq.com';
        user1.isAdmin = true;
        user1.nickName = 'admin';
        user1.phoneNumber = '123090891231';

        const user2 = new User();
        user2.username = 'admin2';
        user2.password = '123456';
        user2.email = 'admin2@qq.com';
        user2.isAdmin = true;
        user2.nickName = 'admin2';
        user2.phoneNumber = '112323090891231';

        const role1 = new Role();
        role1.name = '管理员';

        const role2 = new Role();
        role2.name = '普通用户';

        const permission1 = new Permission();
        permission1.code = 'ccc';
        permission1.description = '查看用ccc户';

        const permission2 = new Permission();
        permission2.code = 'ddd';
        permission2.description = '查看用ddd户';
    
        user1.roles = [role1];
        user2.roles = [role2];

        role1.permissions = [permission1,permission2];
        role2.permissions = [permission1];

        await this.permissionRepository.save([permission1,permission2]);
        await this.roleRepository.save([role1,role2]);
        await this.userRepository.save([user1,user2]);
    }


    async login(loginUserDto: LoginUserDto, isAdmin: boolean){
        const user = await this.userRepository.findOne({
            where: {
                username: loginUserDto.username,
                isAdmin
            },
            relations: ['roles', 'roles.permissions']
        });

        if(!user){
            throw new HttpException('用户不存在',HttpStatus.BAD_REQUEST);
        }
        console.log(md5(loginUserDto.password))
        if(user.password !== md5(loginUserDto.password)){
            throw new HttpException('密码错误',HttpStatus.BAD_REQUEST);
        }

        const vo = new LoginUserVo();
        vo.userInfo = {
            id: user.id,
            username: user.username,
            nickName: user.nickName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            headPic: user.headPic,
            createTime: user.createTime.getTime(),
            isFrozen: user.isFrozen,
            isAdmin: user.isAdmin,
            roles: user.roles.map(role => role.name),
            permissions: Array.from(new Set(user.roles.map(role => role.permissions.map(permission => permission.code)).flat()))
        }

        return vo;
    }

    async findUserById(userId: number, isAdmin: boolean){
        const user = await this.userRepository.findOne({
            where: {
                id: userId,
                isAdmin
            },
            relations: ['roles', 'roles.permissions']
        });

        return{
            id: user.id,
            username: user.username,
            isAdmin: user.isAdmin,
            roles: user.roles.map(item => item.name),
            permissions: Array.from(new Set(user.roles.map(role => role.permissions.map(permission => permission.code)).flat()))
        }
    }
}
