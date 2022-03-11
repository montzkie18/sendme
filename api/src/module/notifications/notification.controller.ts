import { BadRequestException, Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import {
  CreateNotificationSchema,
  NotificationDto,
} from '../../dto/notification.dto';
import { UserId } from '../auth/auth';
import { NotificationService } from './notification.service';
import { validateSchema } from '../../utils';
import { NotificationStatus } from '../../types';

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

  @Post('notifications/:notificationId/retry')
  async retry(@Param('notificationId') notificationId: string) {
    let notification;
    try {
      notification = await this.notificationService.getById(notificationId);
    } catch(e) {
      throw new NotFoundException(`Notification ${notificationId} not found`);
    }

    const successLog = (notification.logs ?? []).find(log => log.status === NotificationStatus.SUCCESS);
    if (successLog) {
      throw new BadRequestException(`User already got notified with the same event`);
    }

    await this.notificationService.retry(notification);
  }
}
