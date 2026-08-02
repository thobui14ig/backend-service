import { GroupEntity } from 'src/modules/group/entities/group.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('tiktok_users')
export class UserTiktokEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "nickname" })
    nickname: string;

    @Column({ name: "name" })
    name: string;

    @Column({ name: "user_id" })
    userId: number;

    @Column({ name: "is_online" })
    isOnline: boolean;

    @ManyToOne(() => UserEntity, (user) => user.pages)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}
