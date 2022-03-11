import { Body, Controller, Get, Post } from '@nestjs/common';
import {
  CreateNotificationSchema,
  NotificationDto,
} from '../../dto/notification.dto';
import { UserId } from '../auth/auth';
import { NotificationService } from './notification.service';
import { validateSchema } from '../../utils';

@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get('notifications')
  async getByUser(@UserId() userId: string): Promise<NotificationDto[]> {
    return this.notificationService.getByUser(userId);
  }

  @Post('notifications')
  create(
    @UserId() userId: string,
    @Body() body: any,
  ): Promise<NotificationDto> {
    const params = { ...body, user: { id: userId } };
    validateSchema(CreateNotificationSchema, params);
    return this.notificationService.create(params);
  }
}
