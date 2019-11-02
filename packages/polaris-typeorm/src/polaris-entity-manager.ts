import {
    Connection, DeepPartial, DeleteResult, EntityManager, EntitySchema,
    FindManyOptions, FindOneOptions, ObjectID, SaveOptions, UpdateResult
} from "typeorm";
import {runAndMeasureTime} from "./common-polaris";
import {FindHandler} from "./handlers/find-handler";
import {DataVersionHandler} from "./handlers/data-version-handler";
import {SoftDeleteHandler} from "./handlers/soft-delete-handler";

//todo: check if throw error logs an error in mgf
//todo: typeorm not supporting exist
//todo: paging in db
//todo: saveandflush
//todo: find all ids including deleted elements for irrelevant entities query select by entitiy only spec is reality
export class PolarisEntityManager extends EntityManager {

    dataVersionHandler: DataVersionHandler;
    findHandler: FindHandler;
    softDeleteHandler: SoftDeleteHandler;

    constructor(connection: Connection) {
        super(connection, connection.createQueryRunner());
        this.queryRunner && (this.queryRunner.data = {context: {}});
        this.dataVersionHandler = new DataVersionHandler(this);
        this.findHandler = new FindHandler(this);
        this.softDeleteHandler = new SoftDeleteHandler(this);
    }

    getContext = () => { return this.queryRunner? this.queryRunner.data.context: {}};

    calculateCriteria(target: any, includeLinkedOper: boolean, criteria: any) {
        return target.toString().includes("CommonModel") ?
            this.findHandler.findConditions(includeLinkedOper, criteria) : criteria;
    }


    async delete<Entity>(targetOrEntity: any, criteria: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | any): Promise<DeleteResult> {
        let run = await runAndMeasureTime(async () => {
            let calculatedCriteria: FindManyOptions = this.calculateCriteria(targetOrEntity, false, criteria);
            let metadata = this.connection.entityMetadatas.find(meta => meta.target == targetOrEntity);
            metadata ? calculatedCriteria.relations = metadata.relations.map(relation => relation.propertyName) : {};
            let entities: Entity[] = await super.find(targetOrEntity, calculatedCriteria);
            if (entities.length > 0) {
                let config = this.connection.options.extra.config;
                if (config && config.softDelete && config.softDelete.allow == false) {
                    return await this.wrapTransaction(async () => {
                        await this.dataVersionHandler.updateDataVersion();
                        return await super.delete(targetOrEntity, calculatedCriteria);
                    });
                }
                return await this.softDeleteHandler.softDeleteRecursive(targetOrEntity, entities);
            } else {
                let errMessage = 'there are no entities to delete';
                this.queryRunner && (this.queryRunner.data.logError = true);
                this.connection.logger.log("log", errMessage, this.queryRunner);
                throw new Error(errMessage);
            }
        });
        this.queryRunner && (this.queryRunner.data.elapsedTime = run.time);
        this.connection.logger.log("log", 'finished delete action successfully', this.queryRunner);
        return run.returnValue;
    }

    async findOne<Entity>(entityClass: any, idOrOptionsOrConditions?: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | FindOneOptions<Entity> | any, maybeOptions?: FindOneOptions<Entity>): Promise<Entity | undefined> {
        let run = await runAndMeasureTime(async () => {
            return super.findOne(entityClass, this.calculateCriteria(entityClass, true, idOrOptionsOrConditions), maybeOptions);
        });
        this.queryRunner && (this.queryRunner.data.elapsedTime = run.time);
        this.connection.logger.log("log", 'finished find one action successfully', this.queryRunner);
        return run.returnValue;
    }

    async find<Entity>(entityClass: any, optionsOrConditions?: FindManyOptions<Entity> | any): Promise<Entity[]> {
        let run = await runAndMeasureTime(async () => {
            return super.find(entityClass, this.calculateCriteria(entityClass, true, optionsOrConditions));
        });
        this.queryRunner && (this.queryRunner.data.elapsedTime = run.time);
        this.connection.logger.log("log", 'finished find action successfully', this.queryRunner);
        return run.returnValue;
    }


    async count<Entity>(entityClass: any, optionsOrConditions?: FindManyOptions<Entity> | any): Promise<number> {
        let run = await runAndMeasureTime(async () => {
            return super.count(entityClass, this.calculateCriteria(entityClass, false, optionsOrConditions));
        });
        this.queryRunner && (this.queryRunner.data.elapsedTime = run.time);
        this.connection.logger.log("log", 'finished count action successfully', this.queryRunner);
        return run.returnValue;
    }

    async save<Entity, T extends DeepPartial<Entity>>(targetOrEntity: any, maybeEntityOrOptions?: T | T[], maybeOptions?: SaveOptions): Promise<T | T[]> {
        let run = await runAndMeasureTime(async () => {
            if (targetOrEntity.toString().includes("CommonModel")) {
                await this.wrapTransaction(async () => {
                    await this.dataVersionHandler.updateDataVersion();
                    await this.saveDataVersionAndRealityId(targetOrEntity, maybeEntityOrOptions);
                    return await super.save(targetOrEntity, maybeEntityOrOptions, maybeOptions);
                });
            } else {
                return await super.save(targetOrEntity, maybeEntityOrOptions, maybeOptions);
            }
        });
        this.queryRunner && (this.queryRunner.data.elapsedTime = run.time);
        this.connection.logger.log("log", 'finished save action successfully', this.queryRunner);
        return run.returnValue;
    }

    async update<Entity>(target: { new(): Entity } | Function | EntitySchema<Entity> | string, criteria: string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | any, partialEntity: any): Promise<UpdateResult> {

        let run = await runAndMeasureTime(async () => {
            await this.wrapTransaction(async () => {
                await this.dataVersionHandler.updateDataVersion();
                let globalDataVersion = this.getContext().globalDataVersion;
                partialEntity = {...partialEntity, ...{dataVersion: globalDataVersion}};
                return super.update(target, criteria, partialEntity);
            });
        });
        this.queryRunner && (this.queryRunner.data.elapsedTime = run.time);
        this.connection.logger.log("log", 'finished update action successfully', this.queryRunner);
        return run.returnValue;
    }

    async wrapTransaction(action: any) {
        let runner: any = this.queryRunner;
        try {
            let transactionStartedByUs = false;
            if (!runner.isTransactionActive) {
                await runner.startTransaction();
                transactionStartedByUs = true;
            }
            let result = await action();
            if (transactionStartedByUs) {
                await runner.commitTransaction();
            }
            return result;
        } catch (err) {
            this.queryRunner && (this.queryRunner.data.logError = true);
            this.connection.logger.log("log", err.message, this.queryRunner);
            return await runner.rollbackTransaction();
        }
    }

    async saveDataVersionAndRealityId(targetOrEntity: any, maybeEntityOrOptions?: any) {
        if (maybeEntityOrOptions instanceof Array) {
            for (let t of maybeEntityOrOptions) {
                t.dataVersion = this.getContext().globalDataVersion;
                this.setRealityIdOfEntity(t);
            }
        } else {
            maybeEntityOrOptions.dataVersion = this.getContext().globalDataVersion;
            this.setRealityIdOfEntity(maybeEntityOrOptions);
        }
    }

    setRealityIdOfEntity(entity: any) {
        let realityIdFromHeader = this.getContext().realityId || 0;
        if (entity.realityId === undefined) {
            entity.realityId = realityIdFromHeader;
        } else if (entity.realityId != realityIdFromHeader) {
            let errMessage = 'reality id of entity is different from header';
            this.queryRunner && (this.queryRunner.data.logError = true);
            this.connection.logger.log("log", errMessage, this.queryRunner);
            throw new Error(errMessage);
        }
    }
}