// src/logging.interceptor.ts
import {
    CallHandler,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserService } from 'src/modules/user/user.service';
import { LinkService } from '../links.service';
import { LinkStatus, LinkType } from '../entities/links.entity';
import { isNullOrUndefined } from 'src/common/utils/check-utils';
import { getPlan } from 'src/common/utils/plan';

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
        const plan = getPlan(userFromDb.planId)
        const totalLinkFromDb = await this.linkService.getTotalLinkUserByStatus(user["id"])
        const totalLink = totalLinkFromDb + request.body.links.length

        if (userFromDb && !isNullOrUndefined(totalLink)) {
            if (totalLink > plan.maxLinks) {
                throw new HttpException(
                    `Vượt quá số link gói đang mua. Chỉ có thể thêm ${plan.maxLinks-totalLinkFromDb}`,
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
