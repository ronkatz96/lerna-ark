import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'dataVersion' })
export class DataVersion {
    @PrimaryGeneratedColumn()
    private id: number = 1;

    @Column()
    private readonly value: number;

    constructor(value: number) {
        this.value = value;
    }

    public getId(): number {
        return this.id;
    }

    public getValue(): number {
        return this.value;
    }
}
