import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationLog } from '../../entity/NotificationLog';
import { CreateNotificationLogDto } from '../../dto/notification-log.dto';

@Injectable()
export class NotificationLogService {
  constructor(
    @InjectRepository(NotificationLog)
    private readonly notificationLogsRepo: Repository<NotificationLog>,
  ) {}

  async create(params: CreateNotificationLogDto) {
    const log = this.notificationLogsRepo.create(params);
    const result = await this.notificationLogsRepo.save(log);
    return result;
  }
}
