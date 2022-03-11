import { Static, Type } from '@sinclair/typebox';
import { EventType } from '../types';

export const CreateNotificationSchema = Type.Object({
  user: Type.Object({
    id: Type.String({ format: 'uuid' }),
  }),
  eventId: Type.String({
    minLength: 1,
  }),
  eventType: Type.Enum(EventType),
  eventMetadata: Type.Object({}),
});

export const NotificationSchema = Type.Intersect([
  CreateNotificationSchema,
  Type.Object({
    id: Type.String({ format: 'uuid' }),
    dateCreated: Type.String({ format: 'date-time' }),
  }),
]);

export type CreateNotificationDto = Static<typeof CreateNotificationSchema>;
export type NotificationDto = Static<typeof NotificationSchema>;
