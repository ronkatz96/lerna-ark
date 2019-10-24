import {CommonModel} from "../../index";
import {Column, Entity} from "typeorm";

@Entity()
export class Profile extends CommonModel {

    constructor(gender?: string) {
        super();
        gender ? this.gender = gender : {};
    }

    @Column()
    gender: string;
}