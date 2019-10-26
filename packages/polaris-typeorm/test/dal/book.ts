import {Author} from "./author";
import {CommonModel} from "../../src";
import {Column, Entity, ManyToOne} from "typeorm";
import {Library} from "./library";

@Entity()
export class Book extends CommonModel {

    constructor(title?: string, author?: Author) {
        super();
        title ? this.title = title : {};
        author ? this.author = author : {};
    }

    @Column()
    title: string;

    @ManyToOne(() => Author, (author) => author.books, {onDelete: 'CASCADE'})
    author: Author;

    @ManyToOne(() => Library, (library) => library.books, {onDelete: 'CASCADE'})
    library: Library;
}