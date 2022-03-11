import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { NotificationStatus } from '../types';
import { Notification } from './Notification';

@Entity()
export class NotificationLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Notification, (notification) => notification.logs)
  @JoinColumn({ name: 'notification_id', referencedColumnName: 'id' })
  notification: Notification;

  @Column({
    type: 'enum',
    enum: NotificationStatus,
  })
  status: NotificationStatus;

  @Column({
    type: 'timestamptz',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateCreated: string;
}
