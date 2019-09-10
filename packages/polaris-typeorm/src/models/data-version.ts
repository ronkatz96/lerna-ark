import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class DataVersion {
    @PrimaryGeneratedColumn()
    id: number = 1;

    @Column({type: "long"})
    value: number;
}