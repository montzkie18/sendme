import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  CreateNotificationLogSchema,
  NotificationLogDto,
} from '../../dto/notification-log.dto';
import { UserId } from '../auth/auth';
import { NotificationLogService } from './notification-log.service';
import { validateSchema } from '../../utils';

@Controller()
export class NotificationLogController {
  constructor(
    private readonly notificationLogService: NotificationLogService,
  ) {}

  @Post('notification-logs')
  create(@Body() body: any): Promise<NotificationLogDto> {
    validateSchema(CreateNotificationLogSchema, body);
    return this.notificationLogService.create(body);
  }
}
