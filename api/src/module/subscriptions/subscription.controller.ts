import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import {
  CreateSubscriptionSchema,
  SubscriptionDto,
  SubscriptionSchema,
  SubscriptionsSchema,
} from '../../dto/subscription.dto';
import { UserId } from '../auth/auth';
import { SubscriptionService } from './subscription.service';
import { validateSchema } from '../../utils';
import { ApiBody, ApiCreatedResponse, ApiOkResponse, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller()
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('subscriptions')
  @ApiOkResponse({
    schema: SubscriptionsSchema
  })
  async getByUser(@UserId() userId: string): Promise<SubscriptionDto[]> {
    return this.subscriptionService.getByUser(userId);
  }

  @Post('subscriptions')
  @ApiCreatedResponse({
    schema: SubscriptionSchema
  })
  @ApiBody({
    schema: CreateSubscriptionSchema
  })
  create(
    @UserId() userId: string,
    @Body() body: any,
  ): Promise<SubscriptionDto> {
    const params = { ...body, user: { id: userId } };
    validateSchema(CreateSubscriptionSchema, params);
    return this.subscriptionService.create(params);
  }

  @Put('subscriptions/:eventType')
  @ApiCreatedResponse({
    schema: SubscriptionSchema
  })
  @ApiBody({
    schema: CreateSubscriptionSchema
  })
  @ApiParam({
    name: "eventType",
    type: String
  })
  upsert(
    @UserId() userId: string,
    @Param("eventType") eventType: string,
    @Body() body: any,
  ): Promise<SubscriptionDto> {
    const params = { ...body, eventType, user: { id: userId } };
    validateSchema(CreateSubscriptionSchema, params);
    return this.subscriptionService.upsert(params);
  }
}
