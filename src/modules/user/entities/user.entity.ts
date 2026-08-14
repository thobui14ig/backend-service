import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { LinkEntity } from '../../links/entities/links.entity';
import { CommentEntity } from 'src/modules/comments/entities/comment.entity';
import { CookieEntity } from 'src/modules/cookie/entities/cookie.entity';
import { OrderEntity } from 'src/modules/order/entities/order.entity';
import { GroupEntity } from 'src/modules/group/entities/group.entity';
import { PageEntity } from 'src/modules/page/entities/page.entity';

export enum LEVEL {
  ADMIN = 1,
  USER = 0
}

export enum ILanguage {
  VI = 'vi',
  EN = 'en'
}

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  username: string;

  @Column()
  password: string;
  
  @Column({ default: LEVEL.USER })
  level?: LEVEL;

  @Column({ default: ILanguage.VI })
  language?: ILanguage;

  @Column()
  balance: number

  @Column({ name: "plan_id" })
  planId: number

  @Column({ name: "phone" })
  phone: string

  @Column({ default: false, name: 'is_deleted' })
  isDelete: Boolean;

  @Column({ name: 'total_link' })
  totalLink: number;

  @Column({ name: 'max_page' })
  maxPage: number;

  @Column({ name: 'discount_amount' })
  discountAmount: number;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ 
    name: "expired_at",         
    transformer: {
        to: (value) => value,
        from: (value: Date) => {
        if (!value) return null;

        const pad = (n: number, z = 2) => String(n).padStart(z, '0');

        return (
            value.getFullYear() + '-' +
            pad(value.getMonth() + 1) + '-' +
            pad(value.getDate()) + ' ' +
            pad(value.getHours()) + ':' +
            pad(value.getMinutes()) + ':' +
            pad(value.getSeconds()) + '.' +
            pad(value.getMilliseconds(), 3)
        );
        }
        } 
      })
  expiredAt: string;

  @Column({ 
    name: "last_active_at",         
    transformer: {
        to: (value) => value,
        from: (value: Date) => {
        if (!value) return null;

        const pad = (n: number, z = 2) => String(n).padStart(z, '0');

        return (
            value.getFullYear() + '-' +
            pad(value.getMonth() + 1) + '-' +
            pad(value.getDate()) + ' ' +
            pad(value.getHours()) + ':' +
            pad(value.getMinutes()) + ':' +
            pad(value.getSeconds()) + '.' +
            pad(value.getMilliseconds(), 3)
        );
        }
        } 
      })
  lastActiveAt: string;

  @Column({ default: false, name: 'is_active' })
  isActive : Boolean;

  @Column({ default: 0, name: 'type_config' })
  typeConfig: number

  @Column({ default: false, name: 'is_get_phone' })
  isGetPhone: Boolean;

  @OneToMany(() => LinkEntity, (link) => link.user)
  links: LinkEntity[]

  @OneToMany(() => PageEntity, (page) => page.user)
  pages: PageEntity[]

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[]

  @OneToMany(() => CookieEntity, (comment) => comment.cookie)
  cookie: CookieEntity[]

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[]

  @OneToMany(() => GroupEntity, (group) => group.user)
  groups: GroupEntity[]
}
