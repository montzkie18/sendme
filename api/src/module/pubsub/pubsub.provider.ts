import { Provider } from "@nestjs/common";
import { PubsubClient } from "./pubsub.client";

export const pubsubClientProvider: Provider<PubsubClient> = {
    provide: PubsubClient,
    useFactory: () => new PubsubClient({
        projectId: 'com_trial_sendme'
    }),
}