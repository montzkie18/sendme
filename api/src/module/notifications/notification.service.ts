import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entity/Notification';
import { CreateNotificationDto } from '../../dto/notification.dto';
import { PubsubClient } from '../pubsub/pubsub.client';
import { SubscriptionService } from '../subscriptions/subscription.service';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
    private readonly pubsubClient: PubsubClient,
    private readonly subscriptionService: SubscriptionService
  ) {}

  async getByUser(userId: string) {
    return this.notificationsRepo.find({
      where: { user: { id: userId } },
      relations: ['user', 'logs'],
      order: {
        dateCreated: 'DESC',
      },
    });
  }

  async create(params: CreateNotificationDto) {
    const subscriptions = await this.subscriptionService.getByUser(params.user.id);
    const subscription = subscriptions.find((s) => s.eventType === params.eventType);
    if (!subscription) {
      throw new BadRequestException(`User ${params.user.id} is not subscribed to ${params.eventType}`);
    }

    const duplicate = await this.notificationsRepo.findOne({
      where: {
        eventId: params.eventId
      }
    });
    if (duplicate) {
      throw new ConflictException(`A notification has already been created for event ${params.eventId}`);
    }

    const notification = this.notificationsRepo.create(params);
    const result = await this.notificationsRepo.save(notification);
    await this.pubsubClient.triggerWebhook({
      ...params,
      id: result.id,
      callbackUrl: subscription.callbackUrl,
      timestamp: Date.now(),
    });
    return result;
  }
}
