import { LinkEntity } from 'src/modules/links/entities/links.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';

export enum OrderStatus {
    PENDING = 'pending',
    CALLED = 'called',
    SUCCESS = 'success',
    FAILED = 'failed',
}

@Entity('comments')
export class CommentEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'post_id', type: 'varchar', length: 255 })
    postId: string;

    @Column({ name: 'user_uid', type: 'varchar', length: 255, nullable: true })
    userUid: string;

    @Column({ name: 'username', type: 'varchar', length: 255, nullable: true })
    username: string;

    @Column({ name: 'message', type: 'text', nullable: true })
    message: string;

    @Column({ name: 'created_at' })
    timeCreated: Date;

    @Column({
        name: 'phone_number',
    })
    phoneNumber: string;

    @Column({ name: 'address'})
    address: string;

    @Column({ name: 'note'})
    note: string;

    @Column({ name: 'cmt_id'})
    cmtId: string;

    @Column({ name: 'link_id', type: 'int' })
    linkId: number;

    @Column({
        name: 'order_status',
        type: 'enum',
        enum: OrderStatus,
        enumName: 'order_status_enum',
        default: OrderStatus.PENDING,
    })
    orderStatus: OrderStatus;

    @ManyToOne(() => LinkEntity, (link) => link.comments)
    @JoinColumn({ name: 'link_id' })
    link: LinkEntity;

}