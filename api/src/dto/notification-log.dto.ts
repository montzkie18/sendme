import { Static, Type } from '@sinclair/typebox';
import { NotificationStatus } from '../types';

export const CreateNotificationLogSchema = Type.Object({
  notification: Type.Object({
    id: Type.String({ format: 'uuid' }),
  }),
  status: Type.Enum(NotificationStatus),
});

export const NotificationLogSchema = Type.Intersect([
  CreateNotificationLogSchema,
  Type.Object({
    id: Type.String({ format: 'uuid' }),
    dateCreated: Type.String({ format: 'date-time' }),
  }),
]);

export type CreateNotificationLogDto = Static<
  typeof CreateNotificationLogSchema
>;
export type NotificationLogDto = Static<typeof NotificationLogSchema>;
