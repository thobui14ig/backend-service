import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export type OrderStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

@Entity('orders')
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column()
    status?: OrderStatus;

    @Column()
    content: number;

    @Column()
    amount?: number
}
