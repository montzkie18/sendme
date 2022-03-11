import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLogController } from './notification-log.controller';
import { NotificationLogService } from './notification-log.service';
import { Notification } from '../../entity/Notification';
import { NotificationLog } from '../../entity/NotificationLog';
import { User } from '../../entity/User';
import { pubsubClientProvider } from '../pubsub/pubsub.provider';

@Module({
  imports: [TypeOrmModule.forFeature([Notification, NotificationLog, User])],
  providers: [NotificationLogService, pubsubClientProvider],
  controllers: [NotificationLogController],
})
export class NotificationLogModule {}
