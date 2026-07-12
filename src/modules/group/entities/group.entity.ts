import { LinkEntity } from 'src/modules/links/entities/links.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

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

    @OneToMany(() => LinkEntity, (link) => link.group)
    links: LinkEntity[];
}
