import { CommentEntity } from 'src/modules/comments/entities/comment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { GroupEntity } from 'src/modules/group/entities/group.entity';

export enum LinkStatus {
  Pending = 'pending',
  Started = 'started',
}

export enum LinkType {
  DIE = 'die',
  UNDEFINED = 'undefined',
  PUBLIC = 'public',
  PRIVATE = 'private',
}

export enum HideBy {
  ALL = 'all',
  PHONE = 'phone',
  KEYWORDS = 'keywords'
}

export enum EPlatform {
  TIKTOK = "tiktok",
  FACEBOOK = "facebook"
}

@Entity('links')
export class LinkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 255, name: 'link_name', nullable: true })
  linkName: string;

  @Column({ name: 'content', nullable: true })
  content: string;

  @Column({ length: 255, name: 'link_url' })
  linkUrl: string;

  @Column({ length: 255, nullable: true, name: 'post_id' })
  postId: string | null;

  @Column({ length: 255, nullable: true, name: 'post_id_v1' })
  postIdV1: string | null;

  @Column({ name: 'last_comment_time' })
  lastCommentTime: Date;

  @Column({ type: 'int', default: 0, name: 'delay_time' })
  delayTime: number;

  @Column({ default: 'pending' })
  status: LinkStatus;

  @Column()
  type: LinkType;

  @Column({ default: false })
  process: boolean;

  @Column({ default: false, name: 'is_deleted' })
  isDelete: boolean;

  @Column({ name: 'group_id' })
  groupId: number;

  @Column({ name: 'page_id' })
  pageId: string;

  @Column({ name: 'total_cmt' })
  totalCmt: number;

  @Column({ name: 'total_like' })
  totalLike: number;

  @Column({ name: 'thumbnail' })
  thumbnail: string;

  @Column({ name: 'is_get_old_comment' })
  isGetOldCmt: boolean;

  @Column({ name: 'platform' })
  platform: EPlatform

  @CreateDateColumn({
    name: 'created_at',
  })
  createdAt: Date;

  @ManyToOne(() => UserEntity, (user) => user.links)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.link)
  comments: CommentEntity[];

  @ManyToOne(() => GroupEntity, (group) => group.links)
  @JoinColumn({ name: 'group_id' })
  group: GroupEntity;
}
