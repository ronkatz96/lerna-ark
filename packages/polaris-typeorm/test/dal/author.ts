import {CommonModel} from "../../src";
import {Column, Entity, OneToMany} from "typeorm";
import {Book} from "./book";
import {Library} from "./library";

@Entity()
export class Author extends CommonModel {

    constructor(name?: string, books?: Book[]) {
        super();
        name ? this.name = name : {};
        books ? this.books = books : {};
    }

    @Column()
    name: string;

    @OneToMany(() => Book, (books) => books.author)
    books: Book[];

    @OneToMany(() => Library, (libraries) => libraries.author)
    libraries: Library[];
}