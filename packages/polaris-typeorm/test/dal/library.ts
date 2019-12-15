import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Author } from './author';
import { Book } from './book';

@Entity()
export class Library {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({
        type: 'real',
        default: 0,
    })
    public dataVersion: string;

    @Column()
    public realityId: number = 0;

    @Column({ nullable: true })
    public createdBy: string;

    @CreateDateColumn()
    public creationTime: Date;

    @Column({ nullable: true })
    public lastUpdatedBy: string;

    @UpdateDateColumn()
    public lastUpdateTime: Date;

    @Column()
    public deleted: boolean = false;

    @Column()
    public name: string;

    @ManyToOne(
        () => Author,
        author => author.libraries,
        { onDelete: 'CASCADE' },
    )
    public author: Author;

    @OneToMany(
        () => Book,
        books => books.library,
    )
    public books: Book[];
    constructor(name?: string, books?: Book[]) {
        if (name) {
            this.name = name;
        }
        if (books) {
            this.books = books;
        }
    }
}
