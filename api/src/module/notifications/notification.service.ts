import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entity/Notification';
import { CreateNotificationDto } from '../../dto/notification.dto';
import { PubsubClient } from '../pubsub/pubsub.client';
import { SubscriptionService } from '../subscriptions/subscription.service';
import { EventType } from '../../types';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationsRepo: Repository<Notification>,
    private readonly pubsubClient: PubsubClient,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async getById(id: string) {
    return this.notificationsRepo.findOneOrFail({
      where: { id },
      relations: ['user', 'logs'],
    });
  }

  async getByUser(userId: string) {
    return this.notificationsRepo.find({
      where: { user: { id: userId } },
      relations: ['user', 'logs'],
      order: {
        dateCreated: 'DESC',
      },
    });
  }

  async getUserSubscriptionForEventType(userId: string, eventType: EventType) {
    const subscriptions = await this.subscriptionService.getByUser(userId);
    const subscription = subscriptions.find((s) => s.eventType === eventType);
    if (!subscription) {
      throw new BadRequestException(
        `User ${userId} is not subscribed to ${eventType}`,
      );
    }
    return subscription;
  }

  async create(params: CreateNotificationDto) {
    const duplicate = await this.notificationsRepo.findOne({
      where: {
        eventId: params.eventId,
      },
    });
    if (duplicate) {
      throw new ConflictException(
        `A notification has already been created for event ${params.eventId}`,
      );
    }

    const subscription = await this.getUserSubscriptionForEventType(
      params.user.id,
      params.eventType,
    );

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

  async retry(notification: Notification) {
    const { callbackUrl } = await this.getUserSubscriptionForEventType(
      notification.user.id,
      notification.eventType,
    );
    const { id, user, eventId, eventType, eventMetadata } = notification;
    await this.pubsubClient.triggerWebhook({
      id,
      user,
      eventId,
      eventType,
      eventMetadata,
      callbackUrl,
      timestamp: Date.now(),
    });
  }
}
