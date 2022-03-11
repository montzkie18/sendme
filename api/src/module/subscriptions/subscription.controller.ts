import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  CreateSubscriptionSchema,
  SubscriptionDto,
} from '../../dto/subscription.dto';
import { UserId } from '../auth/auth';
import { SubscriptionService } from './subscription.service';
import { validateSchema } from '../../utils';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('subscriptions')
  async getByUser(@UserId() userId: string): Promise<SubscriptionDto[]> {
    return this.subscriptionService.getByUser(userId);
  }

  @Post('subscriptions')
  create(
    @UserId() userId: string,
    @Body() body: any,
  ): Promise<SubscriptionDto> {
    const params = { ...body, user: { id: userId } };
    validateSchema(CreateSubscriptionSchema, params);
    return this.subscriptionService.create(params);
  }
}