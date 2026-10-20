import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export type OrderStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

@Entity('orders')
export class OrderEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column()
    status?: OrderStatus;

    @Column({ type: 'varchar', length: 255 })
    content: string;

    @Column()
    amount?: number

    @CreateDateColumn({
        name: 'created_at',
        transformer: {
        to: (value) => value,
        from: (value: Date) => {
        if (!value) return null;

        const pad = (n: number, z = 2) => String(n).padStart(z, '0');

        return (
            value.getFullYear() + '-' +
            pad(value.getMonth() + 1) + '-' +
            pad(value.getDate()) + ' ' +
            pad(value.getHours()) + ':' +
            pad(value.getMinutes()) + ':' +
            pad(value.getSeconds()) + '.' +
            pad(value.getMilliseconds(), 3)
        );
        }
        }
    })
    createdAt: Date;

    @ManyToOne(() => UserEntity, (user) => user.orders)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity
}
