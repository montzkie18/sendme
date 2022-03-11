import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { EventType } from '../types';
import { NotificationLog } from './NotificationLog';
import { User } from './User';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @OneToMany(() => NotificationLog, (log) => log.notification)
  logs: NotificationLog[];

  @Column({
    unique: true,
  })
  eventId: string;

  @Column({
    type: 'enum',
    enum: EventType,
  })
  eventType: EventType;

  @Column({ type: 'jsonb' })
  eventMetadata: any;

  @Column({
    type: 'timestamptz',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  dateCreated: string;
}
