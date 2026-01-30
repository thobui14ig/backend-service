import { PageEntity } from 'src/modules/page/entities/page.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('group_link')
export class GroupEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ name: "user_id" })
    userId: number;

    @OneToMany(() => PageEntity, (page) => page.group)
    pages: []
}
