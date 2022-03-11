import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import * as Path from 'path';
import { AppModule } from './../src/app.module';
import { EventType, NotificationStatus } from '../src/types';
import { Connection } from 'typeorm';
import {
  clearDatabase,
  loadFixtures,
  NotificationLogSnapshotSerializer,
  NotificationSnapshotSerializer,
  SubscriptionSnapshotSerializer,
} from './testing-utils';

expect.addSnapshotSerializer(SubscriptionSnapshotSerializer);
expect.addSnapshotSerializer(NotificationSnapshotSerializer);
expect.addSnapshotSerializer(NotificationLogSnapshotSerializer);

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

    it('fails on duplicate eventType', async () => {
      await loadFixtures(
        connection,
        Path.join(
          __dirname,
          'fixtures/post-subscriptions-duplicate-event-type',
        ),
      );
      const res = await request(app.getHttpServer())
        .post('/subscriptions')
        .send({
          eventType: EventType.INVOICES_PAID,
          callbackUrl: 'http://some-url.com',
        });
      expect(res.statusCode).toEqual(409);
      expect(res.body).toMatchInlineSnapshot(`
        Object {
          "error": "Conflict",
          "message": "Subscription already exists for event type: INVOICES_PAID",
          "statusCode": 409,
        }
      `);
    });

    it('fails on invalid eventType', async () => {
      await loadFixtures(connection);
      const res = await request(app.getHttpServer())
        .post('/subscriptions')
        .send({
          eventType: 'INVALID_EVENT_TYPE',
          callbackUrl: 'http://www.google.com',
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toMatchInlineSnapshot(`
        Object {
          "ajv": true,
          "errors": Array [
            Object {
              "instancePath": "/eventType",
              "keyword": "const",
              "message": "must be equal to constant",
              "params": Object {
                "allowedValue": "ACCOUNT_LINKED",
              },
              "schemaPath": "#/properties/eventType/anyOf/0/const",
            },
            Object {
              "instancePath": "/eventType",
              "keyword": "const",
              "message": "must be equal to constant",
              "params": Object {
                "allowedValue": "PAYMENT_COMPLETED",
              },
              "schemaPath": "#/properties/eventType/anyOf/1/const",
            },
            Object {
              "instancePath": "/eventType",
              "keyword": "const",
              "message": "must be equal to constant",
              "params": Object {
                "allowedValue": "INVOICES_PAID",
              },
              "schemaPath": "#/properties/eventType/anyOf/2/const",
            },
            Object {
              "instancePath": "/eventType",
              "keyword": "const",
              "message": "must be equal to constant",
              "params": Object {
                "allowedValue": "ACCOUNT_CREATED",
              },
              "schemaPath": "#/properties/eventType/anyOf/3/const",
            },
            Object {
              "instancePath": "/eventType",
              "keyword": "const",
              "message": "must be equal to constant",
              "params": Object {
                "allowedValue": "ACCOUNT_UPDATED",
              },
              "schemaPath": "#/properties/eventType/anyOf/4/const",
            },
            Object {
              "instancePath": "/eventType",
              "keyword": "anyOf",
              "message": "must match a schema in anyOf",
              "params": Object {},
              "schemaPath": "#/properties/eventType/anyOf",
            },
          ],
          "validation": true,
        }
      `);
    });

    it('fails on invalid callbackUrl', async () => {
      await loadFixtures(connection);
      const res = await request(app.getHttpServer())
        .post('/subscriptions')
        .send({
          eventType: EventType.INVOICES_PAID,
          callbackUrl: null,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toMatchInlineSnapshot(`
        Object {
          "ajv": true,
          "errors": Array [
            Object {
              "instancePath": "/callbackUrl",
              "keyword": "type",
              "message": "must be string",
              "params": Object {
                "type": "string",
              },
              "schemaPath": "#/properties/callbackUrl/type",
            },
          ],
          "validation": true,
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
      await loadFixtures(
        connection,
        Path.join(__dirname, 'fixtures/post-notifications'),
      );
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

    it('fails on duplicate eventId', async () => {
      await loadFixtures(
        connection,
        Path.join(__dirname, 'fixtures/post-notifications-duplicate'),
      );
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
      expect(res.statusCode).toEqual(409);
      expect(res.body).toMatchInlineSnapshot(`
        Object {
          "error": "Conflict",
          "message": "A notification has already been created for event invoice_paid_579c8d61f23fa4ca35e52da4",
          "statusCode": 409,
        }
      `);
    });

    it('fails on invalid eventId', async () => {
      await loadFixtures(
        connection,
        Path.join(__dirname, 'fixtures/post-notifications'),
      );
      const res = await request(app.getHttpServer())
        .post('/notifications')
        .send({
          eventId: 100,
          eventType: EventType.INVOICES_PAID,
          eventMetadata: {
            invoice_id: '579c8d61f23fa4ca35e52da4',
            amount: 1000,
          },
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toMatchInlineSnapshot(`
        Object {
          "ajv": true,
          "errors": Array [
            Object {
              "instancePath": "/eventId",
              "keyword": "type",
              "message": "must be string",
              "params": Object {
                "type": "string",
              },
              "schemaPath": "#/properties/eventId/type",
            },
          ],
          "validation": true,
        }
      `);
    });

    it('fails on invalid eventType', async () => {
      await loadFixtures(
        connection,
        Path.join(__dirname, 'fixtures/post-notifications'),
      );
      const res = await request(app.getHttpServer())
        .post('/notifications')
        .send({
          eventId: 'invoice_paid_579c8d61f23fa4ca35e52da4',
          eventType: null,
          eventMetadata: {
            invoice_id: '579c8d61f23fa4ca35e52da4',
            amount: 1000,
          },
        });
      expect(res.statusCode).toEqual(400);
    });

    it('fails on invalid eventMetadata', async () => {
      await loadFixtures(
        connection,
        Path.join(__dirname, 'fixtures/post-notifications'),
      );
      const res = await request(app.getHttpServer())
        .post('/notifications')
        .send({
          eventId: 'invoice_paid_579c8d61f23fa4ca35e52da4',
          eventType: EventType.INVOICES_PAID,
          eventMetadata: 100,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toMatchInlineSnapshot(`
        Object {
          "ajv": true,
          "errors": Array [
            Object {
              "instancePath": "/eventMetadata",
              "keyword": "type",
              "message": "must be object",
              "params": Object {
                "type": "object",
              },
              "schemaPath": "#/properties/eventMetadata/type",
            },
          ],
          "validation": true,
        }
      `);
    });
  });

  describe('POST /notifications/:notificationId/retry', () => {
    it('retries a notification with only failed logs', async () => {
      await loadFixtures(
        connection,
        Path.join(__dirname, 'fixtures/post-notifications-retry'),
      );
      const res = await request(app.getHttpServer())
        .post('/notifications/39560f68-d466-4fe5-bb5e-bcede7f5f24a/retry')
        .send();
      expect(res.statusCode).toEqual(201);
      expect(res.body).toMatchInlineSnapshot(`Object {}`);
    });

    it('fails when notification is already successful', async () => {
      await loadFixtures(
        connection,
        Path.join(
          __dirname,
          'fixtures/post-notifications-retry-already-successful',
        ),
      );
      const res = await request(app.getHttpServer())
        .post('/notifications/39560f68-d466-4fe5-bb5e-bcede7f5f24a/retry')
        .send();
      expect(res.statusCode).toEqual(400);
      expect(res.body).toMatchInlineSnapshot(`
        Object {
          "error": "Bad Request",
          "message": "User already got notified with the same event",
          "statusCode": 400,
        }
      `);
    });

    it('fails when notification is not found', async () => {
      await loadFixtures(connection);
      const res = await request(app.getHttpServer())
        .post('/notifications/39560f68-d466-4fe5-bb5e-bcede7f5f24a/retry')
        .send();
      expect(res.statusCode).toEqual(404);
      expect(res.body).toMatchInlineSnapshot(`
        Object {
          "error": "Not Found",
          "message": "Notification 39560f68-d466-4fe5-bb5e-bcede7f5f24a not found",
          "statusCode": 404,
        }
      `);
    });
  });

  describe('POST /notification-logs', () => {
    it('creates and returns a new notification log', async () => {
      await loadFixtures(
        connection,
        Path.join(__dirname, 'fixtures/post-notification-logs'),
      );
      const res = await request(app.getHttpServer())
        .post('/notification-logs')
        .send({
          notification: { id: '39560f68-d466-4fe5-bb5e-bcede7f5f24a' },
          status: NotificationStatus.SUCCESS,
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toMatchInlineSnapshot(`
        {
          "notification": {
            "id": "39560f68-d466-4fe5-bb5e-bcede7f5f24a"
          },
          "status": "SUCCESS"
        }
      `);
    });
  });
});
