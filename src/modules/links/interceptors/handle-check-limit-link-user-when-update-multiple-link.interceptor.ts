// src/logging.interceptor.ts
import {
    CallHandler,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { isNullOrUndefined } from 'src/common/utils/check-utils';
import { UserService } from 'src/modules/user/user.service';
import { LinkStatus } from '../entities/links.entity';
import { LinkService } from '../links.service';

@Injectable()
export class CheckLimitLinkUserWhenUpdateMultipleLinkInterceptor implements NestInterceptor {
    constructor(private userService: UserService, private linkService: LinkService) { }

    async intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const user = request["user"]
        const isDelete = request.body["isDelete"]
        const status = (request.body["onOff"] ? "started" : "pending") as LinkStatus
        const isHideCmt = request.body["hideCmt"]
        const linkIds = request.body["linkIds"]
        const userFromDb = await this.userService.findById(user["id"])
        const totalLink = await this.linkService.getTotalLinkUserWhenUpdateMultipleLink(user["id"], status, isHideCmt, linkIds)
        if (isDelete) return next.handle()

        if (userFromDb && !isNullOrUndefined(totalLink)) {
            if (isHideCmt === false) {


            } else {

            }

            return next.handle()
        } else {
            throw new HttpException(
                `Error.`,
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
