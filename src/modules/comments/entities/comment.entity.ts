import { LinkEntity } from 'src/modules/links/entities/links.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

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

    @Column({ name: 'cmt_id', type: 'varchar', length: 255 })
    cmt_id: string;

    @Column({ name: 'link_id', type: 'int' })
    linkId: number;

    @ManyToOne(() => LinkEntity, (link) => link.comments)
    @JoinColumn({ name: 'link_id' })
    link: LinkEntity

    @ManyToOne(() => UserEntity, (user) => user.comments)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity
}
