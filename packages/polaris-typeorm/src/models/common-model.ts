import {Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

export abstract class CommonModel {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    dataVersion: number;

    @Column()
    realityId: number;

    @Column()
    createdBy: string;

    @CreateDateColumn()
    creationTime: Date;

    @Column()
    lastUpdatedBy: string;

    @UpdateDateColumn()
    lastUpdateTime: Date;

    @Column()
    deleted: boolean;
}