
import {
  Entity,
  Column,
  PrimaryColumn,
} from 'typeorm';

@Entity('bidv_noti')
export class BidvNotiEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 255,
  })
  code: string;

  @Column({
    name: 'user_id',
    type: 'integer',
    nullable: false,
  })
  userId: number;

  @Column({
    type: 'bigint',
    nullable: false,
  })
  amount: string | number;

  @Column({
    type: 'boolean',
    default: false,
    nullable: false,
  })
  status: boolean;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    precision: 6,
    default: () => "(CURRENT_TIMESTAMP AT TIME ZONE 'UTC')",
    nullable: false,
  })
  createdAt: Date;
}
