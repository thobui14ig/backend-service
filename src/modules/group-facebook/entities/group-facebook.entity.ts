import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('group_auto')
export class GroupFacebookEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ name: "group_id" })
    groupId: string;

    @Column({ name: "user_id" })
    userId: number;
}
