import { Connection } from 'typeorm';
import * as Path from 'path';
import * as fs from 'fs';

async function getEntities(connection: Connection) {
  return ['user', 'subscription', 'notification', 'notification_log'].map(
    (name) => ({ name, tableName: name }),
  );
  /**
   * TODO: Add topomap for entity relationship so parent tables get loaded first.
  return (await connection.entityMetadatas).map(({ name, tableName }) => ({
    name,
    tableName,
  }));
  */
}

export async function clearDatabase(connection: Connection) {
  const entities = await getEntities(connection);
  try {
    for (const entity of entities) {
      const repository = await connection.getRepository(entity.name);
      await repository.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE;`);
    }
  } catch (error) {
    throw new Error(`ERROR: Cleaning test db: ${error}`);
  }
}

export async function loadFixtures(
  connection: Connection,
  fixturePath: string = '',
) {
  const entities = await getEntities(connection);
  try {
    for (const entity of entities) {
      const repository = await connection.getRepository(entity.name);
      const paths = [Path.join(__dirname, 'fixtures/common'), fixturePath];
      for (const path of paths) {
        const fixtureFile = Path.join(path, `${entity.name}.json`);
        if (fs.existsSync(fixtureFile)) {
          const items = JSON.parse(fs.readFileSync(fixtureFile, 'utf8'));
          await repository
            .createQueryBuilder(entity.name)
            .insert()
            .values(items)
            .execute();
        }
      }
    }
  } catch (error) {
    throw new Error(
      `ERROR [TestUtils.loadAll()]: Loading fixtures on test db: ${error}`,
    );
  }
}

export const SubscriptionSnapshotSerializer = {
  test: (val: any) => {
    return [
      'eventType',
      'callbackUrl',
      'user',
      'id',
      'dateCreated',
      'dateUpdated',
    ].every((key) => !!val[key]);
  },
  print: ({ user, eventType, callbackUrl }) =>
    JSON.stringify({ user, eventType, callbackUrl }, null, 2),
};

export const NotificationSnapshotSerializer = {
  test: (val: any) => {
    return [
      'eventId',
      'eventType',
      'eventMetadata',
      'user',
      'id',
      'dateCreated',
    ].every((key) => !!val[key]);
  },
  print: ({ user, eventId, eventType, eventMetadata }) =>
    JSON.stringify({ user, eventId, eventType, eventMetadata }, null, 2),
};

export const NotificationLogSnapshotSerializer = {
  test: (val: any) => {
    return [, 'id', 'notification', 'status', 'dateCreated'].every(
      (key) => !!val[key],
    );
  },
  print: ({ notification, status }) =>
    JSON.stringify({ notification, status }, null, 2),
};
