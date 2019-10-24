import {
    Connection, DeepPartial, DeleteResult, EntityManager, EntitySchema,
    FindManyOptions, FindOneOptions, ObjectID, ObjectType, SaveOptions, UpdateResult
} from "typeorm";
import {softDeleteRecursive} from "./handlers/soft-delete-handler";
import {QueryDeepPartialEntity} from "typeorm/query-builder/QueryPartialEntity";
import {TypeORMConfig, runAndMeasureTime, PolarisContext} from "./common-polaris";
import {FindHandler} from "./handlers/find-handler";
import {DataVersionHandler} from "./handlers/data-version-handler";
import {PolarisGraphQLLogger} from "@enigmatis/polaris-graphql-logger"

//todo: check if throw error logs an error in mgf
//todo: typeorm not supporting exist
//todo: paging in db
//todo: saveandflush
//todo: find all ids including deleted elements for irrelevant entities query select by entitiy only spec is reality
export class PolarisEntityManager extends EntityManager {

    config: TypeORMConfig;
    dataVersionHandler: DataVersionHandler;
    findHandler: FindHandler;
    logger: PolarisGraphQLLogger<PolarisContext>;

    constructor(connection: Connection, config: TypeORMConfig, logger: PolarisGraphQLLogger<PolarisContext>) {
        super(connection, connection.createQueryRunner());
        this.queryRunner.data = {context: {}};
        this.logger = logger;
        this.config = config;
        this.dataVersionHandler = new DataVersionHandler(this);
        this.findHandler = new FindHandler(this);
    }

    calculateCriteria(target, includeLinkedOper, criteria) {
        return target.toString().includes("CommonModel") ?
            this.findHandler.findConditions(includeLinkedOper, criteria) : criteria;
    }

    async delete<Entity>(targetOrEntity: { new(): Entity } | Function | EntitySchema<Entity> | string, criteria: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | any): Promise<DeleteResult> {
        let run = await runAndMeasureTime(async () => {
            let calculatedCriteria = this.calculateCriteria(targetOrEntity, false, criteria);
            // @ts-ignore
            let entities: Entity[] = await super.find(targetOrEntity, calculatedCriteria);
            if (entities.length > 0) {
                if (this.config && this.config.softDelete && this.config.softDelete.allow == false) {
                    return await this.wrapTransaction(async () => {
                        await this.dataVersionHandler.updateDataVersion();
                        return await super.delete(targetOrEntity, calculatedCriteria);
                    });
                }
                return await softDeleteRecursive(targetOrEntity, entities, this);
            } else {
                throw new Error('there are no entities to delete');
            }
        });
        this.logger.debug('finished delete action successfully', {
            context: this.queryRunner.data.context,
            polarisLogProperties: {elapsedTime: run.time}
        });
        return run.returnValue;
    }

    async findOne<Entity>(entityClass: ObjectType<Entity> | EntitySchema<Entity> | string, idOrOptionsOrConditions?: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | FindOneOptions<Entity> | any, maybeOptions?: FindOneOptions<Entity>): Promise<Entity | undefined> {
        let run = await runAndMeasureTime(async () => {
            // @ts-ignore
            return super.findOne(entityClass, this.calculateCriteria(entityClass, true, idOrOptionsOrConditions), maybeOptions);
        });
        this.logger.debug('finished find one action successfully', {
            context: this.queryRunner.data.context,
            polarisLogProperties: {elapsedTime: run.time}
        });
        return run.returnValue;
    }

    async find<Entity>(entityClass: ObjectType<Entity> | EntitySchema<Entity> | string, optionsOrConditions?: FindManyOptions<Entity> | any): Promise<Entity[]> {
        let run = await runAndMeasureTime(async () => {
            // @ts-ignore
            return super.find(entityClass, this.calculateCriteria(entityClass, true, optionsOrConditions));
        });
        this.logger.debug('finished find action successfully', {
            context: this.queryRunner.data.context,
            polarisLogProperties: {elapsedTime: run.time}
        });
        return run.returnValue;
    }


    async count<Entity>(entityClass: ObjectType<Entity> | EntitySchema<Entity> | string, optionsOrConditions?: FindManyOptions<Entity> | any): Promise<number> {
        let run = await runAndMeasureTime(async () => {
            // @ts-ignore
            return super.count(entityClass, this.calculateCriteria(entityClass, false, optionsOrConditions));
        });
        this.logger.debug('finished count action successfully', {
            context: this.queryRunner.data.context,
            polarisLogProperties: {elapsedTime: run.time}
        });
        return run.returnValue;
    }

    async save<Entity, T extends DeepPartial<Entity>>(targetOrEntity: (T | T[]) | ObjectType<Entity> | EntitySchema<Entity> | string, maybeEntityOrOptions?: T | T[], maybeOptions?: SaveOptions): Promise<T | T[]> {
        let run = await runAndMeasureTime(async () => {
            if (targetOrEntity.toString().includes("CommonModel")) {
                await this.wrapTransaction(async () => {
                    await this.dataVersionHandler.updateDataVersion();
                    await this.saveDataVersionAndRealityId(targetOrEntity, maybeEntityOrOptions);
                    // @ts-ignore
                    return await super.save(targetOrEntity, maybeEntityOrOptions, maybeOptions);
                });
            } else {
                // @ts-ignore
                return await super.save(targetOrEntity, maybeEntityOrOptions, maybeOptions);
            }
        });
        this.logger.debug('finished save action successfully', {
            context: this.queryRunner.data.context,
            polarisLogProperties: {elapsedTime: run.time}
        });
        return run.returnValue;
    }


    async update<Entity>(target: { new(): Entity } | Function | EntitySchema<Entity> | string, criteria: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | any, partialEntity: QueryDeepPartialEntity<Entity>): Promise<UpdateResult> {
        let run = await runAndMeasureTime(async () => {
            await this.wrapTransaction(async () => {
                await this.dataVersionHandler.updateDataVersion();
                partialEntity = {...partialEntity, ...{dataVersion: this.queryRunner.data.context.globalDataVersion}};
                return super.update(target, criteria, partialEntity);
            });
        });
        this.logger.debug('finished update action successfully', {
            context: this.queryRunner.data.context,
            polarisLogProperties: {elapsedTime: run.time}
        });
        return run.returnValue;
    }

    async wrapTransaction(action: any) {
        try {
            await this.queryRunner.startTransaction();
            let result = await action();
            await this.queryRunner.commitTransaction();
            return result;
        } catch (err) {
            return await this.queryRunner.rollbackTransaction();
        }
    }

    async saveDataVersionAndRealityId(targetOrEntity: any, maybeEntityOrOptions?: any) {
        if (maybeEntityOrOptions instanceof Array) {
            for (let t of maybeEntityOrOptions) {
                t.dataVersion = this.queryRunner.data.context.globalDataVersion;
                this.setRealityIdOfEntity(t);
            }
        } else {
            maybeEntityOrOptions.dataVersion = this.queryRunner.data.context.globalDataVersion;
            this.setRealityIdOfEntity(maybeEntityOrOptions);
        }
    }

    setRealityIdOfEntity(entity) {
        let realityIdFromHeader = this.queryRunner.data.context.realityId ? this.queryRunner.data.context.realityId : 0;
        if (entity.realityId === undefined) {
            entity.realityId = realityIdFromHeader;
        } else if (entity.realityId != realityIdFromHeader) {
            throw new Error('reality id of entity is different from header');
        }
    }
}