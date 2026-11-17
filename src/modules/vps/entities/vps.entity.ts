import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum VpsStatus {
  Live = "live",
  Die = "die",
}

export enum VpsType {
  Post = "post",
  Livestream = "livestream",
  User = "user",
  Cronjob = "cronjob",
  ProcessPhone = "process-phone",
  UserPrivate = "user_private",
}

@Entity("vps")
export class VpsEntity {
  @PrimaryGeneratedColumn({ type: "integer" })
  id: number;

  @Column({ type: "varchar", length: 255 })
  ip: string;

  @Column({ type: "integer" })
  port: number;

  @Column({ type: "varchar", length: 255, default: "0" })
  speed: string;

  @Column({
    type: "enum",
    enum: VpsStatus,
    enumName: "vps_status",
    default: VpsStatus.Live,
  })
  status: VpsStatus;

  @Column({
    type: "enum",
    enum: VpsType,
    enumName: "vps_type_enum",
    default: VpsType.Post,
  })
  type: VpsType;
}
