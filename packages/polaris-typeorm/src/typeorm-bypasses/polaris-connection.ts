import { Connection, EntitySchema, ObjectType } from 'typeorm';
import { PolarisEntityManager } from './polaris-entity-manager';
import { PolarisRepository } from './polaris-repository';

/**
 * Connection is a single database ORM connection to a specific database.
 * Its not required to be a database connection, depend on database type it can create connection pool.
 * You can have multiple typeorm-bypasses to multiple databases in your application.
 */
export class PolarisConnection extends Connection {
    // @ts-ignore
    public manager: PolarisEntityManager;
    /**
     * Gets repository for the given entity.
     */
    // @ts-ignore
    public getRepository<Entity>(
        target: ObjectType<Entity> | EntitySchema<Entity> | string,
    ): PolarisRepository<Entity> {
        return this.manager.getRepository(target);
    }

    public hasRepository<Entity>(
        target: ObjectType<Entity> | EntitySchema<Entity> | string,
    ): boolean {
        return this.manager.hasRepository(target);
    }
}
