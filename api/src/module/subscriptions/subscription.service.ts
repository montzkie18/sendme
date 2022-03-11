import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

  create(params: CreateSubscriptionDto) {
    const subscription = this.subscriptionsRepo.create(params);
    return this.subscriptionsRepo.save(subscription);
  }
}
