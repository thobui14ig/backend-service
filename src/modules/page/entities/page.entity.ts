import { GroupEntity } from 'src/modules/group/entities/group.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity('page')
export class PageEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: "page_id" })
    pageId: string;

    @Column({ name: "name" })
    name: string;

    @Column({ name: "user_id" })
    userId: number;

    @Column({ name: "is_active" })
    isActive: boolean;
}
