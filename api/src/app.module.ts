import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { NotificationModule } from './module/notifications/notification.module';
import { SubscriptionModule } from './module/subscriptions/subscription.module';
import { NotificationLogModule } from './module/notification-logs/notification-log.module';

const DB_CONFIG: ConnectionOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'sendme',
  entities: [__dirname + '/../../entity/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../../migration/*.migration{.ts,.js}'],
  synchronize: true,
  namingStrategy: new SnakeNamingStrategy(),
};

@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...DB_CONFIG,
      autoLoadEntities: true,
    }),
    ConfigModule.forRoot(),
    SubscriptionModule,
    NotificationModule,
    NotificationLogModule,
  ],
})
export class AppModule {}
