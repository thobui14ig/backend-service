import { UserEntity } from "../user/entities/user.entity";
import { CreateLinkDTO } from "./dto/create-link.dto";
import { LinkStatus, LinkType } from "./entities/links.entity";

export interface CreateLinkParams extends CreateLinkDTO {
    userId: number
}

export interface BodyLinkQuery {
    type: LinkType
    userId: number
    keyword: string
}

export interface ISettingLinkDto {
    isDelete: boolean
    onOff: boolean
    delay: number
    linkIds: number[]
    hideCmt: boolean
    type: LinkStatus
}

export interface IGetLinkDeleted { userId: number | null, keyword: string | null, limit: number, offset: number }