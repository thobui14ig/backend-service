import { GroupEntity } from 'src/modules/group/entities/group.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('page')
export class PageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "page_id" })
    pageId: string;

    @Column({ name: "group_id" })
    groupId: number;

    @Column({ name: "user_id" })
    userId: number;

    @ManyToOne(() => GroupEntity, (group) => group.pages)
    @JoinColumn({ name: 'group_id' })
    group: GroupEntity;
}
