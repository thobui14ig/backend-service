import { UserEntity } from 'src/modules/user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CookieStatus } from '../domain/cookie-status.enum';

export { CookieStatus } from '../domain/cookie-status.enum';

@Entity('cookie')
export class CookieEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text' })
    cookie: string;

    @Column({ name: 'created_by' })
    createdBy: number;


    @Column({ type: 'enum', enum: CookieStatus, default: CookieStatus.ACTIVE })
    status: CookieStatus;

    @Column({ name: 'fb_id', })
    fbId: string;

    @Column({ name: 'fb_dtsg', })
    fbDtsg: string;

    @Column({ name: 'jazoest', })
    jazoest: string;

    @ManyToOne(() => UserEntity, (user) => user.links)
    @JoinColumn({ name: 'created_by' })
    user: UserEntity;
}