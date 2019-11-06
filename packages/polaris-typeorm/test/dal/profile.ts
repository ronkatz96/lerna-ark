import { Column, Entity } from 'typeorm';
import { CommonModel } from '../../src';

@Entity()
export class Profile extends CommonModel {
    @Column()
    public gender: string;
    constructor(gender?: string) {
        super();
        if (gender) {
            this.gender = gender;
        }
    }
}
