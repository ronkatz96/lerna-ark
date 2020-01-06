import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import { Connection, DeepPartial, DeleteResult, EntityManager, FindOneOptions, ObjectID, UpdateResult } from 'typeorm';
import { PolarisCriteria } from './contextable-options/polaris-criteria';
import { PolarisFindManyOptions } from './contextable-options/polaris-find-many-options';
import { PolarisFindOneOptions } from './contextable-options/polaris-find-one-options';
import { PolarisSaveOptions } from './contextable-options/polaris-save-options';
import { DataVersionHandler } from './handlers/data-version-handler';
import { FindHandler } from './handlers/find-handler';
import { SoftDeleteHandler } from './handlers/soft-delete-handler';

export class PolarisEntityManager extends EntityManager {
    private static async setInfoOfCommonModel(
        context: PolarisGraphQLContext,
        maybeEntityOrOptions?: any,
    ) {
        if (maybeEntityOrOptions instanceof Array) {
            for (const t of maybeEntityOrOptions) {
                t.dataVersion = context.returnedExtensions.globalDataVersion;
                t.realityId = context.requestHeaders.realityId || 0;
                PolarisEntityManager.setUpnOfEntity(t, context);
            }
        } else {
            maybeEntityOrOptions.dataVersion = context.returnedExtensions.globalDataVersion;
            maybeEntityOrOptions.realityId = context.requestHeaders.realityId || 0;
            PolarisEntityManager.setUpnOfEntity(maybeEntityOrOptions, context);
        }
    }

    private static setUpnOfEntity(entity: any, context: any) {
        if (entity.creationTime !== undefined) {
            entity.createdBy =
                context.requestHeaders.upn || context.requestHeaders.requestingSystemId;
        } else {
            entity.lastUpdatedBy =
                context.requestHeaders.upn || context.requestHeaders.requestingSystemId;
        }
    }
    public dataVersionHandler: DataVersionHandler;
    public findHandler: FindHandler;
    public softDeleteHandler: SoftDeleteHandler;

    constructor(connection: Connection) {
        super(connection, connection.createQueryRunner());
        this.dataVersionHandler = new DataVersionHandler(this);
        this.findHandler = new FindHandler();
        this.softDeleteHandler = new SoftDeleteHandler(this);
    }

    public async delete<Entity>(
        targetOrEntity: any,
        criteria:
            | string
            | string[]
            | number
            | number[]
            | Date
            | Date[]
            | ObjectID
            | ObjectID[]
            | any,
    ): Promise<DeleteResult> {
        if (criteria instanceof PolarisCriteria) {
            return this.wrapTransaction(async () => {
                await this.dataVersionHandler.updateDataVersion(criteria.context);
                const config = this.connection.options.extra.config;
                if (
                    (config && config.allowSoftDelete === false) ||
                    !targetOrEntity.toString().includes('CommonModel')
                ) {
                    return super.delete(targetOrEntity, criteria.criteria);
                }
                return this.softDeleteHandler.softDeleteRecursive(targetOrEntity, criteria);
            });
        } else {
            return super.delete(targetOrEntity, criteria);
        }
    }

    public async findOne<Entity>(
        entityClass: any,
        criteria:
            | string
            | string[]
            | number
            | number[]
            | Date
            | Date[]
            | ObjectID
            | ObjectID[]
            | FindOneOptions<Entity>
            | any,
        maybeOptions?: FindOneOptions<Entity>,
    ): Promise<Entity | undefined> {
        if (criteria instanceof PolarisFindOneOptions) {
            return super.findOne(
                entityClass,
                this.calculateCriteria<Entity>(entityClass, true, criteria),
                maybeOptions,
            );
        } else {
            return super.findOne(entityClass, criteria, maybeOptions);
        }
    }

    public async find<Entity>(
        entityClass: any,
        criteria?: PolarisFindManyOptions<Entity> | any,
    ): Promise<Entity[]> {
        if (criteria instanceof PolarisFindManyOptions) {
            return super.find(
                entityClass,
                this.calculateCriteria<Entity>(entityClass, true, criteria),
            );
        } else {
            return super.find(entityClass, criteria);
        }
    }

    public async count<Entity>(
        entityClass: any,
        criteria?: PolarisFindManyOptions<Entity> | any,
    ): Promise<number> {
        if (criteria instanceof PolarisFindManyOptions) {
            return super.count(
                entityClass,
                this.calculateCriteria<Entity>(entityClass, false, criteria),
            );
        } else {
            return super.count(entityClass, criteria);
        }
    }

    public async save<Entity, T extends DeepPartial<Entity>>(
        targetOrEntity: any,
        maybeEntityOrOptions?: PolarisSaveOptions<Entity, T> | any,
        maybeOptions?: any,
    ): Promise<T | T[]> {
        if (
            maybeEntityOrOptions instanceof PolarisSaveOptions &&
            targetOrEntity.toString().includes('CommonModel')
        ) {
            return this.wrapTransaction(async () => {
                await this.dataVersionHandler.updateDataVersion(maybeEntityOrOptions.context);
                await PolarisEntityManager.setInfoOfCommonModel(
                    maybeEntityOrOptions.context,
                    maybeEntityOrOptions.entities,
                );
                return super.save(targetOrEntity, maybeEntityOrOptions.entities, maybeOptions);
            });
        } else {
            return super.save(targetOrEntity, maybeEntityOrOptions, maybeOptions);
        }
    }

    public async update<Entity>(
        target: any,
        criteria: PolarisFindOneOptions<Entity> | any,
        partialEntity: any,
    ): Promise<UpdateResult> {
        return this.wrapTransaction(async () => {
            await this.dataVersionHandler.updateDataVersion(criteria.context);
            const globalDataVersion = criteria.context.returnedExtensions.globalDataVersion;
            const upnOrRequestingSystemId = criteria.context.requestHeaders
                ? criteria.context.requestHeaders.upn ||
                  criteria.context.requestHeaders.requestingSystemId
                : '';
            partialEntity = {
                ...partialEntity,
                dataVersion: globalDataVersion,
                lastUpdatedBy: upnOrRequestingSystemId,
            };
            delete partialEntity.realityId;
            return super.update(target, criteria.criteria, partialEntity);
        });
    }

    private async wrapTransaction(action: any) {
        const runner: any = this.queryRunner;
        try {
            let transactionStartedByUs = false;
            if (!runner.isTransactionActive) {
                await runner.startTransaction();
                transactionStartedByUs = true;
            }
            const result = await action();
            if (transactionStartedByUs) {
                await runner.commitTransaction();
            }
            return result;
        } catch (err) {
            this.connection.logger.log('log', err.message);
            await runner.rollbackTransaction();
        }
    }

    private calculateCriteria<Entity>(target: any, includeLinkedOper: boolean, criteria: any) {
        return target.toString().includes('CommonModel')
            ? this.findHandler.findConditions<Entity>(includeLinkedOper, criteria)
            : criteria;
    }
}
