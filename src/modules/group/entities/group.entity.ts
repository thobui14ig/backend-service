import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('group_link')
export class GroupEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ name: "user_id" })
    userId: number;
}
