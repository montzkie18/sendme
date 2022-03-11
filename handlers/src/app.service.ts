import { Inject, Injectable } from '@nestjs/common';
import { Axios } from 'axios';
import config from './config';
import { NotificationMessage, NotificationStatus } from './types';

@Injectable()
export class AppService {
  constructor(
    @Inject('API_CLIENT')
    private readonly apiClient: Axios,
  ) {}

  async triggerWebhook(notification: NotificationMessage) {
    let didTrigger = false;
    try {
      await this.apiClient.post(notification.callbackUrl, notification, {
        'axios-retry': { retries: 3 },
      });
      didTrigger = true;
    } catch (e) {
      console.log('Failed to trigger webhook', e.config["axios-retry"]);
    }

    try {
      await this.apiClient.post(`${config.apiBaseUrl}/notification-logs`, {
        notification: {
          id: notification.id,
        },
        status: didTrigger ? NotificationStatus.SUCCESS : NotificationStatus.FAILED,
      }, {
        'axios-retry': { retries: 3 }
      });
    } catch(e) {
      console.log('Failed to record a notification log', e.config["axios-retry"]);
    }
  }
}
