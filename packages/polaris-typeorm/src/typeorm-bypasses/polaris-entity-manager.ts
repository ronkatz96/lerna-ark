import { PolarisGraphQLContext } from '@enigmatis/polaris-common';
import {
    Connection,
    DeepPartial,
    DeleteResult,
    EntityManager,
    EntitySchema,
    FindOneOptions,
    UpdateResult,
} from 'typeorm';
import { RepositoryNotFoundError } from 'typeorm/error/RepositoryNotFoundError';
import {
    CommonModel,
    PolarisCriteria,
    PolarisFindManyOptions,
    PolarisFindOneOptions,
    PolarisSaveOptions,
} from '..';
import { DataVersionHandler } from '../handlers/data-version-handler';
import { FindHandler } from '../handlers/find-handler';
import { SoftDeleteHandler } from '../handlers/soft-delete-handler';
import { PolarisConnection } from './polaris-connection';
import { PolarisRepository } from './polaris-repository';
import { PolarisRepositoryFactory } from './polaris-repository-factory';

export class PolarisEntityManager extends EntityManager {
    private static async setInfoOfCommonModel(
        context: PolarisGraphQLContext,
        maybeEntityOrOptions?: any,
    ) {
        if (maybeEntityOrOptions instanceof Array) {
            for (const t of maybeEntityOrOptions) {
                t.dataVersion = context?.returnedExtensions?.globalDataVersion;
                t.realityId = context?.requestHeaders?.realityId ?? 0;
                PolarisEntityManager.setUpnOfEntity(t, context);
            }
        } else if (maybeEntityOrOptions instanceof Object) {
            maybeEntityOrOptions.dataVersion = context?.returnedExtensions?.globalDataVersion;
            maybeEntityOrOptions.realityId = context?.requestHeaders?.realityId ?? 0;
            PolarisEntityManager.setUpnOfEntity(maybeEntityOrOptions, context);
        }
    }

    private static setUpnOfEntity(entity: any, context: PolarisGraphQLContext) {
        if (context?.requestHeaders) {
            if (entity.creationTime !== undefined) {
                entity.createdBy =
                    context?.requestHeaders?.upn || context?.requestHeaders?.requestingSystemId;
            } else {
                entity.lastUpdatedBy =
                    context?.requestHeaders?.upn || context?.requestHeaders?.requestingSystemId;
            }
        }
    }
    // @ts-ignore
    public connection: PolarisConnection;
    public dataVersionHandler: DataVersionHandler;
    public findHandler: FindHandler;
    public softDeleteHandler: SoftDeleteHandler;
    // @ts-ignore
    protected repositories: Array<PolarisRepository<any>>;

    constructor(connection: PolarisConnection) {
        super((connection as unknown) as Connection, connection?.createQueryRunner());
        this.dataVersionHandler = new DataVersionHandler((this as unknown) as EntityManager);
        this.findHandler = new FindHandler();
        this.softDeleteHandler = new SoftDeleteHandler((this as unknown) as EntityManager);
    }
    // @ts-ignore
    public getRepository<Entity>(
        target: (new () => Entity) | Function | EntitySchema<Entity> | string,
    ): PolarisRepository<Entity> {
        // throw exception if there is no repository with this target registered
        if (!this.connection.hasMetadata(target as any)) {
            throw new RepositoryNotFoundError(this.connection.name, target);
        }
        // find already created repository instance and return it if found
        const metadata = this.connection.getMetadata(target as any);
        const repository: PolarisRepository<any> | undefined = this.repositories.find(
            repo => repo.metadata === metadata,
        );
        if (repository) {
            return repository;
        }
        // if repository was not found then create it, store its instance and return it
        const newRepository: PolarisRepository<any> = new PolarisRepositoryFactory().create(
            (this as unknown) as EntityManager,
            metadata,
            this.queryRunner,
        );
        this.repositories.push(newRepository);
        return newRepository;
    }

    public async delete<Entity>(
        targetOrEntity: any,
        criteria: PolarisCriteria | any,
    ): Promise<DeleteResult> {
        if (criteria instanceof PolarisCriteria) {
            return this.wrapTransaction(async () => {
                criteria.context = criteria.context || {};
                await this.dataVersionHandler.updateDataVersion(criteria.context);
                if (
                    this.connection.options.extra?.config?.allowSoftDelete === false ||
                    !targetOrEntity.toString().includes(CommonModel.name)
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
        criteria: PolarisFindOneOptions<Entity> | any,
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
            targetOrEntity.toString().includes(CommonModel.name)
        ) {
            return this.wrapTransaction(async () => {
                maybeEntityOrOptions.context = maybeEntityOrOptions.context || {};
                await this.dataVersionHandler.updateDataVersion(maybeEntityOrOptions.context);
                await PolarisEntityManager.setInfoOfCommonModel(
                    maybeEntityOrOptions.context,
                    maybeEntityOrOptions.entities,
                );
                return super.save(targetOrEntity, maybeEntityOrOptions.entities, maybeOptions);
            });
        } else {
            if (maybeEntityOrOptions instanceof PolarisSaveOptions) {
                maybeEntityOrOptions = maybeEntityOrOptions.entities;
            }
            return super.save(targetOrEntity, maybeEntityOrOptions, maybeOptions);
        }
    }

    public async update<Entity>(
        target: any,
        criteria: PolarisCriteria | any,
        partialEntity: any,
    ): Promise<UpdateResult> {
        if (criteria instanceof PolarisCriteria) {
            return this.wrapTransaction(async () => {
                criteria.context = criteria.context || {};
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
        } else {
            return super.update(target, criteria, partialEntity);
        }
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
            throw err;
        }
    }

    private calculateCriteria<Entity>(target: any, includeLinkedOper: boolean, criteria: any) {
        return target.toString().includes(CommonModel.name)
            ? this.findHandler.findConditions<Entity>(includeLinkedOper, criteria)
            : criteria;
    }
}
