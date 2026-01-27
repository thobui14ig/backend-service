import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}
