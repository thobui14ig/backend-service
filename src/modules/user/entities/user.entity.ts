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

export enum LEVEL {
  ADMIN = 1,
  USER = 0
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

  @Column()
  balance: number

  @Column({ name: "plan_id" })
  planId: number

  @Column({ default: false, name: 'is_deleted' })
  isDelete: Boolean;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @OneToMany(() => LinkEntity, (link) => link.user)
  links: LinkEntity[]

  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[]

  @OneToMany(() => CookieEntity, (comment) => comment.cookie)
  cookie: CookieEntity[]

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[]
}
