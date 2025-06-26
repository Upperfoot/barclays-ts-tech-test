import { Currency } from '../common/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Generated } from 'typeorm';

export enum AccountType {
    personal = 'personal',
}

export { Currency }

@Index(['accountNumber', 'sortCode'], { unique: true })
@Index(['userId', 'name'], { unique: true }) // Optional: user can't have two "Savings"
@Entity('accounts')
export class AccountEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Generated('uuid')
    @Column()
    uuid: string;

    @Column()
    userId: string;

    @Column()
    name: string;

    @Column()
    accountNumber: string;

    @Column()
    sortCode: string;

    @Column({
        type: 'text',
        enum: AccountType
    })
    accountType: AccountType;

    @Column({ default: 0 })
    balance: number;

    @Column({
        type: 'text',
        enum: Currency
    })
    currency: Currency;

    @CreateDateColumn()
    createdTimestamp: Date;

    @UpdateDateColumn()
    updatedTimestamp: Date;
}
