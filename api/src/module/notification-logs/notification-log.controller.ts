import { Body, Controller, Post } from '@nestjs/common';
import {
  CreateNotificationLogSchema,
  NotificationLogDto,
  NotificationLogSchema,
} from '../../dto/notification-log.dto';
import { NotificationLogService } from './notification-log.service';
import { validateSchema } from '../../utils';
import { ApiBody, ApiCreatedResponse } from '@nestjs/swagger';

@Controller()
export class NotificationLogController {
  constructor(
    private readonly notificationLogService: NotificationLogService,
  ) {}

  @Post('notification-logs')
  @ApiBody({
    schema: CreateNotificationLogSchema
  })
  @ApiCreatedResponse({
    schema: NotificationLogSchema
  })
  create(@Body() body: any): Promise<NotificationLogDto> {
    validateSchema(CreateNotificationLogSchema, body);
    return this.notificationLogService.create(body);
  }
}
