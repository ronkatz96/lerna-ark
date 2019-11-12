import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class CommonModel {
    @PrimaryGeneratedColumn('uuid')
    private id: string;

    @Column({
        name: 'dataVersion',
        type: 'real',
        default: 0,
    })
    private dataVersion: string;

    @Column()
    private realityId: number = 0;

    @Column({ nullable: true })
    private createdBy: string;

    @CreateDateColumn()
    private creationTime: Date;

    @Column({ nullable: true })
    private lastUpdatedBy: string;

    @UpdateDateColumn()
    private lastUpdateTime: Date;

    @Column()
    private deleted: boolean = false;

    public getId(): string {
        return this.id;
    }

    public getDataVersion(): string {
        return this.dataVersion;
    }

    public getRealityId(): number {
        return this.realityId;
    }

    public getCreatedBy(): string {
        return this.createdBy;
    }

    public getCreationTime(): Date {
        return this.creationTime;
    }

    public getLastUpdatedBy(): string {
        return this.lastUpdatedBy;
    }

    public getLastUpdateTime(): Date {
        return this.lastUpdateTime;
    }

    public getDeleted(): boolean {
        return this.deleted;
    }

    public setDataVersion(dataVersion: string) {
        this.dataVersion = dataVersion;
    }
    public setRealityId(realityId: number) {
        this.realityId = realityId;
    }

    public setCreatedBy(createdBy: string) {
        this.createdBy = createdBy;
    }

    public setCreationTime(creationTime: Date) {
        this.creationTime = creationTime;
    }

    public setLastUpdatedBy(lastUpdatedBy: string) {
        this.lastUpdatedBy = lastUpdatedBy;
    }

    public setLastUpdateTime(lastUpdateTime: Date) {
        this.lastUpdateTime = lastUpdateTime;
    }

    public setDeleted(deleted: boolean) {
        this.deleted = deleted;
    }
}
