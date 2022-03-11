import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as Path from 'path';
import { AppModule } from './../src/app.module';
import { EventType } from '../src/types';
import { Connection } from 'typeorm';
import {
  clearDatabase,
  loadFixtures,
  NotificationSnapshotSerializer,
  SubscriptionSnapshotSerializer,
} from './testing-utils';

expect.addSnapshotSerializer(SubscriptionSnapshotSerializer);
expect.addSnapshotSerializer(NotificationSnapshotSerializer);

describe('AppModule (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    connection = app.get(Connection);

    await app.init();
  });

  beforeEach(async () => {
    await clearDatabase(connection);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /subscriptions', () => {
    it('returns all subscriptions that belong to user', async () => {
      await loadFixtures(
        connection,
        Path.join(__dirname, 'fixtures/get-subscriptions'),
      );
      const res = await request(app.getHttpServer()).get('/subscriptions');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(3);
    });
  });

  describe('POST /subscriptions', () => {
    it('creates and returns a new subscription', async () => {
      await loadFixtures(connection);
      const res = await request(app.getHttpServer())
        .post('/subscriptions')
        .send({
          eventType: EventType.INVOICES_PAID,
          callbackUrl: 'http://some-url.com',
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toMatchInlineSnapshot(`
        {
          "user": {
            "id": "c1d06b09-0d48-4479-9de4-84b69606601c"
          },
          "eventType": "INVOICES_PAID",
          "callbackUrl": "http://some-url.com"
        }
      `);
    });
  });

  describe('GET /notifications', () => {
    it('returns all notifications that belong to a user', async () => {
      await loadFixtures(
        connection,
        Path.join(__dirname, 'fixtures/get-notifications'),
      );
      const res = await request(app.getHttpServer()).get('/notifications');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('POST /notifications', () => {
    it('creates and returns a new notification', async () => {
      await loadFixtures(connection);
      const res = await request(app.getHttpServer())
        .post('/notifications')
        .send({
          eventId: 'invoice_paid_579c8d61f23fa4ca35e52da4',
          eventType: EventType.INVOICES_PAID,
          eventMetadata: {
            invoice_id: '579c8d61f23fa4ca35e52da4',
            amount: 1000,
          },
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toMatchInlineSnapshot(`
        {
          "user": {
            "id": "c1d06b09-0d48-4479-9de4-84b69606601c"
          },
          "eventId": "invoice_paid_579c8d61f23fa4ca35e52da4",
          "eventType": "INVOICES_PAID",
          "eventMetadata": {
            "invoice_id": "579c8d61f23fa4ca35e52da4",
            "amount": 1000
          }
        }
      `);
    });
  });
});
