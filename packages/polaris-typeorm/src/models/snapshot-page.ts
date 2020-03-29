import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SnapshotPage {
    @PrimaryGeneratedColumn('uuid')
    private readonly id: string;

    @Column('bytea')
    private readonly data: Buffer;

    @CreateDateColumn()
    private readonly creationTime: Date;

    constructor(data: string) {
        if (data) {
            this.data = Buffer.from(data);
        }
    }

    public getId(): string {
        return this.id;
    }

    public getData(): string {
        return this.data.toString();
    }

    public getCreationTime(): Date {
        return this.creationTime;
    }
}
