import { Exclude } from 'class-transformer';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Generated } from 'typeorm';

export interface AddressEntity {
    line1: string;
    line2: string;
    line3: string;
    town: string;
    county: string;
    postcode: string;
}

@Index(['email'], { unique: true }) // Email is unique
@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('increment')
    @Exclude()
    id: number;

    @Generated('uuid')
    @Column()
    @Exclude()
    uuid: string;

    @Column()
    email: string;

    @Column()
    @Exclude()
    password: string;

    @Column()
    name: string;

    @Column({
        type: 'json'
    })
    address: AddressEntity;

    @Column()
    phoneNumber: string;

    @CreateDateColumn()
    createdTimestamp: Date;

    @UpdateDateColumn()
    updatedTimestamp: Date;
}
