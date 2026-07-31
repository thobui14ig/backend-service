import dayjs from "dayjs"
import { EPlatform } from "../links/entities/links.entity"

export interface IGetCommentParams {
    startDate: string 
    endDate: string
    limit: number
    offset: number
    keyword?: string
    groupId?: number | null
    pageId?: number | null
    timezone: string
    isExport: boolean
    hasPhone?: boolean
    platform: EPlatform
}