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

@Injectable()
export class CheckLimitLinkUserWhenAddLinkInterceptor implements NestInterceptor {
    constructor(private userService: UserService, private linkService: LinkService) { }

    async intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const user = request["user"]
        const status = request.body["status"] as LinkStatus
        const isHideCmt = request.body["hideCmt"]
        const userFromDb = await this.userService.findById(user["id"])
        const totalLink = await this.linkService.getTotalLinkUserByStatus(user["id"], status, isHideCmt) + request.body.links.length

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
        return next.handle()
    }
}
