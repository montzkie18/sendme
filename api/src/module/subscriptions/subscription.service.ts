import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateSubscriptionDto } from '../../dto/subscription.dto';
import { Subscription } from '../../entity/Subscription';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionsRepo: Repository<Subscription>,
  ) {}

  async getByUser(userId: string) {
    return this.subscriptionsRepo.find({
      where: { user: { id: userId } },
      relations: ['user'],
    });
  }

  async create(params: CreateSubscriptionDto) {
    const subscription = this.subscriptionsRepo.create(params);
    let result;
    try {
      result = await this.subscriptionsRepo.save(subscription);
    } catch (e) {
      console.log('Failed to create subscription', e.detail);
      // postgres error codes: https://www.postgresql.org/docs/9.2/errcodes-appendix.html
      if (e.code === '23505') {
        // unique_violation
        throw new ConflictException(
          `Subscription already exists for event type: ${params.eventType}`,
        );
      }
      throw new BadRequestException(
        `Failed to subscribe to event type: ${params.eventType}`,
      );
    }
    return result;
  }

  async upsert(params: CreateSubscriptionDto) {
    let subscription = await this.subscriptionsRepo.findOne({
      where: { user: { id: params.user.id }, eventType: params.eventType }
    });
    if (!subscription) {
      subscription = this.subscriptionsRepo.create(params);
    } else {
      subscription.callbackUrl = params.callbackUrl;
    }

    let result;
    try {
      result = await this.subscriptionsRepo.save(subscription);
    } catch (e) {
      throw new BadRequestException(
        `Failed to update subscription to event type: ${params.eventType}`,
      );
    }
    return result;
  }
}
