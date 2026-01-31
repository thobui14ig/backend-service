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
import { LinkStatus } from 'src/modules/links/entities/links.entity';
import { LinkService } from 'src/modules/links/links.service';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class CheckLimitLinkUserWhenEditLinkInterceptor implements NestInterceptor {
    constructor(private userService: UserService, private linkService: LinkService) { }

    async intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const user = request["user"]
        const userFromDb = await this.userService.findById(user["id"])
        const totalLink = await this.linkService.getTotalLinkUserByStatus(user["id"]) + 1

        if (userFromDb && !isNullOrUndefined(totalLink)) {


            return next.handle()
        } else {
            throw new HttpException(
                `Error.`,
                HttpStatus.BAD_REQUEST,
            );
        }


    }
}
