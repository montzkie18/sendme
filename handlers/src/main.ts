import { NestFactory } from '@nestjs/core';
import { PubSubServer } from './libs/pubsub';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.connectMicroservice({
    strategy: new PubSubServer({
      projectId: 'com_trial_sendme',
      topics: {
        trigger_webhook: {
          subscriptionId: 'webhook_subscription',
        },
      },
    }),
  });

  await app.startAllMicroservices();
  await app.listen(3001);
}
bootstrap();
