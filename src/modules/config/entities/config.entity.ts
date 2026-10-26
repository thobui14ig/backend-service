import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'config', schema: 'public' })
export class ConfigEntity {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'excel_id', type: 'bigint', default: 0, nullable: true })
  excelId: string | null;

  @Column({ name: 'link_id', type: 'bigint', default: 0, nullable: true })
  linkId: string | null;

  @Column({ name: 'is_order', type: 'boolean', default: false })
  isOrder: boolean;

  @Column({ name: 'is_convert_uid', type: 'boolean', default: false })
  isConvertUid: boolean;
}
