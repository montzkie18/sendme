import { Static, Type } from '@sinclair/typebox';
import { EventType } from '../types';

export const CreateSubscriptionSchema = Type.Object({
  user: Type.Object({
    id: Type.String({ format: 'uuid' }),
  }),
  eventType: Type.Enum(EventType),
  callbackUrl: Type.String({
    minLength: 1,
    format: 'uri',
  }),
});

export const SubscriptionSchema = Type.Intersect([
  CreateSubscriptionSchema,
  Type.Object({
    id: Type.String({ format: 'uuid' }),
    dateCreated: Type.String({ format: 'date-time' }),
    dateUpdated: Type.String({ format: 'date-time' }),
  }),
]);

export type CreateSubscriptionDto = Static<typeof CreateSubscriptionSchema>;
export type SubscriptionDto = Static<typeof SubscriptionSchema>;
