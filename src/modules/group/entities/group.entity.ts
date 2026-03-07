import { PageEntity } from 'src/modules/page/entities/page.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';

@Entity('group_link')
export class GroupEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ name: "user_id" })
    userId: number;

    @ManyToOne(() => UserEntity, (user) => user.groups)
    @JoinColumn({ name: 'user_id' })
    user: UserEntity;
}
