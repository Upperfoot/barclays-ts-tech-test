import { Currency } from '../common/interfaces';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, Generated } from 'typeorm';

export enum TransactionStatus {
    pending = 'pending',
    failed = 'failed',
    completed = 'completed'
}

export enum TransactionType {
    deposit = 'deposit',
    withdrawal = 'withdrawal'
}

export { Currency }

@Index(['userId', 'accountId', 'idempotencyKey'], { unique: true })
@Entity('transactions')
export class TransactionEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Generated('uuid')
    @Column()
    uuid: string;

    @Column()
    userId: string;

    @Column()
    accountId: string;

    @Column({ default: 0 })
    amount: number;

    @Column({
        type: 'text',
        enum: Currency
    })
    currency: Currency;

    @Column({
        type: 'text',
        enum: TransactionType
    })
    type: TransactionType;

    @Column({
        type: 'text',
        enum: TransactionStatus
    })
    status: TransactionStatus;

    @Column()
    reference: string;

    @Column()
    idempotencyKey: string;

    @CreateDateColumn()
    createdTimestamp: Date;

    @UpdateDateColumn()
    updatedTimestamp: Date;
}
