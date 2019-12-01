import { Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class CommonModel {
    @PrimaryGeneratedColumn('uuid')
    private id: string;

    @Column({
        name: 'dataVersion',
        type: 'real',
        default: 0,
    })
    private dataVersion: number;

    @Column()
    private realityId: number;

    @Column({ nullable: true })
    private createdBy?: string;

    @CreateDateColumn()
    private creationTime: Date;

    @Column({ nullable: true })
    private lastUpdatedBy?: string;

    @UpdateDateColumn()
    private lastUpdateTime: Date;

    @Column()
    private deleted: boolean = false;

    public getId(): string {
        return this.id;
    }

    public getDataVersion(): number {
        return this.dataVersion;
    }

    public getRealityId(): number {
        return this.realityId;
    }

    public getCreatedBy(): string | undefined {
        return this.createdBy;
    }

    public getCreationTime(): Date {
        return this.creationTime;
    }

    public getLastUpdatedBy(): string | undefined {
        return this.lastUpdatedBy;
    }

    public getLastUpdateTime(): Date {
        return this.lastUpdateTime;
    }

    public getDeleted(): boolean {
        return this.deleted;
    }

    public setDataVersion(dataVersion: number) {
        this.dataVersion = dataVersion;
    }
    public setRealityId(realityId: number) {
        this.realityId = realityId;
    }

    public setCreatedBy(createdBy?: string) {
        this.createdBy = createdBy;
    }

    public setCreationTime(creationTime: Date) {
        this.creationTime = creationTime;
    }

    public setLastUpdatedBy(lastUpdatedBy?: string) {
        this.lastUpdatedBy = lastUpdatedBy;
    }

    public setLastUpdateTime(lastUpdateTime: Date) {
        this.lastUpdateTime = lastUpdateTime;
    }

    public setDeleted(deleted: boolean) {
        this.deleted = deleted;
    }
}
