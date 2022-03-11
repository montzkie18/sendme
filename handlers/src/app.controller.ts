import { Message } from '@google-cloud/pubsub';
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('trigger_webhook')
  async triggerWebhook(@Payload() message: Message): Promise<void> {
    const notification = JSON.parse(message.data.toString('utf-8'));
    console.log('Triggered webhook', notification);
    await this.appService.triggerWebhook(notification);
    message.ack();
  }
}
