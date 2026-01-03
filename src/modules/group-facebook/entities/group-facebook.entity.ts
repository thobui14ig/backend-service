import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('groups')
export class GroupFacebookEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ name: "group_id" })
    groupId: string;
}
