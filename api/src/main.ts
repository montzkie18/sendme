import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

export async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // const client = new PubSub({
  //   projectId: 'com_trial_sendme'
  // });
  // const status = await client.topic('trigger_webhook', { batching: { maxMessages: 1 } }).publishMessage({ json: { some: "data" } });
  // console.log("Publish status", status);

  await app.listen(3000);
}
bootstrap();
