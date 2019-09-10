import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class DataVersion {
    constructor(value?: number) {
        value ? this.value = value : {};
    }

    @PrimaryGeneratedColumn()
    id: number = 1;

    @Column()
    value: number;
}