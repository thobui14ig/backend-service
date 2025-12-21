import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export interface IAutoSettingParam {
  type: 'private' | 'public' | 'die' | 'undefined'
  lastCommentFrom?: number
  lastCommentTo?: number
  differenceCountCmtFrom?: number
  differenceCountCmtTo?: number
  delayFrom?: number
  delayTo?: number
  likeFrom?: number
  likeTo?: number
  diffTimeFrom?: number
  diffTimeTo?: number
  totalCmtTodayFrom?: number
  totalCmtTodayTo?: number
  isDelete: boolean
  onOff: boolean
  delay: number
}

@Entity('auto')
export class AutoEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'json' })
  params: Record<string, any>;
}
