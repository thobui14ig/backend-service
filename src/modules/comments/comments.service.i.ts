import dayjs from "dayjs"

export interface IGetCommentParams {
    startDate: string
    endDate: string
    limit: number
    offset: number
    keyword?: string
    groupId?: number | null
    timezone: string
}