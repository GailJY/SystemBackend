import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory(configService: ConfigService){
        console.log(configService.get('redis_server_host'));
        console.log(configService.get('redis_server_port'));
        const client =  createClient({

          socket: {
            host: '127.0.0.1',
            port: 6379
          },
          database: 1
        })
        await client.connect();
        return client;
      },
      inject: [ConfigService]
    },
  ],
  exports: [RedisService]
})
export class RedisModule {}
