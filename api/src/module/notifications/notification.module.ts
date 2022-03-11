import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notification } from '../../entity/Notification';
import { NotificationLog } from '../../entity/NotificationLog';
import { User } from '../../entity/User';
import { pubsubClientProvider } from '../pubsub/pubsub.provider';
import { SubscriptionModule } from '../subscriptions/subscription.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationLog, User]),
    SubscriptionModule,
  ],
  providers: [NotificationService, pubsubClientProvider],
  controllers: [NotificationController],
})
export class NotificationModule {}
