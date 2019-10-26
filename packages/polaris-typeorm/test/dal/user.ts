import {CommonModel} from "../../index";
import {Column, Entity, JoinColumn, OneToOne} from "typeorm";
import {Profile} from "./profile";

@Entity()
export class User extends CommonModel {

    constructor(name?: string, profile?: Profile) {
        super();
        name ? this.name = name : {};
        profile ? this.profile = profile : {};
    }

    @Column()
    name: string;

    @OneToOne(() => Profile)
    @JoinColumn()
    profile: Profile;
}