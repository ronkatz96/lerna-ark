import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Book} from "./book";
import {Author} from "./author";

@Entity()
export class Library {

    constructor(name?: string, books?: Book[]) {
        name ? this.name = name : {};
        books ? this.books = books : {};
    }

    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: 'real',
        default: 0
    })
    dataVersion: string;

    @Column()
    realityId: number = 0;

    @Column({nullable: true})
    createdBy: string;

    @CreateDateColumn()
    creationTime: Date;

    @Column({nullable: true})
    lastUpdatedBy: string;

    @UpdateDateColumn()
    lastUpdateTime: Date;

    @Column()
    deleted: boolean = false;

    @Column()
    name: string;

    @ManyToOne(() => Author, (author) => author.libraries, {onDelete: 'CASCADE'})
    author: Author;

    @OneToMany(() => Book, (books) => books.library)
    books: Book[];
}