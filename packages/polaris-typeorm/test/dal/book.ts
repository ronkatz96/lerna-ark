import {Author} from "./author";
import {CommonModel} from "../../index";
import {Column, Entity, ManyToOne} from "typeorm";

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
}