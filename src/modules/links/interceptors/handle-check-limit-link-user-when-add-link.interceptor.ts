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
import { getPlan } from 'src/common/utils/plan';
import { UserService } from 'src/modules/user/user.service';
import { LinkService } from '../links.service';

@Injectable()
export class CheckLimitLinkUserWhenAddLinkInterceptor implements NestInterceptor {
    constructor(private userService: UserService, private linkService: LinkService) { }

    async intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const user = request["user"]
        const userFromDb = await this.userService.findById(user["id"])
        if (!userFromDb.planId) {
            throw new HttpException(
                `Bạn chưa mua gói víp nào.`,
                HttpStatus.BAD_REQUEST,
            );
        }
        const totalLinkFromDb = await this.linkService.getTotalLinkUserByStatus(user["id"])
        const totalLink = totalLinkFromDb + request.body.links.length

        if (userFromDb && !isNullOrUndefined(totalLink)) {
            if (totalLink > userFromDb.totalLink) {
                throw new HttpException(
                    `Vượt quá số link gói đang mua`,
                    HttpStatus.BAD_REQUEST,
                );
            }
            return next.handle()
        } else {
            throw new HttpException(
                `Error.`,
                HttpStatus.BAD_REQUEST,
            );
        }
        return next.handle()
    }
}
