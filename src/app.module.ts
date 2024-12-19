import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { authPlugins } from 'mysql2';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { Role } from './user/entities/role.entity';
import { Permission } from './user/entities/permission.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'root123456',
      database: 'meeting_room_booking_system',
      entities: [
        User,Role,Permission
      ],
      synchronize: true,
      logging: true,
      poolSize: 10,
      connectorPackage: 'mysql2',
      extra:{
        authPlugins: 'sha256_password',
      }
    }),
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
