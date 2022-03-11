import { ClientConfig, PubSub } from "@google-cloud/pubsub";
import { Injectable } from "@nestjs/common";

@Injectable()
export class PubsubClient {
    private readonly client;

    constructor(options: ClientConfig) {
        this.client = new PubSub(options);
    }

    triggerWebhook(message: any) {
        return this.client
            .topic('trigger_webhook', { batching: { maxMessages: 1 } })
            .publishMessage({ json: message });
    }

    close() {
        return this.client.close();
    }
}