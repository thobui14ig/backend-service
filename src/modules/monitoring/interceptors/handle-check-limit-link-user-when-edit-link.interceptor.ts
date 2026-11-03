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
import { GetUserLinkCountUseCase } from 'src/modules/links/application/use-cases/manage-link.use-cases';
import { GetUserByIdUseCase } from 'src/modules/user/application/use-cases/manage-users.use-cases';

@Injectable()
export class CheckLimitLinkUserWhenEditLinkInterceptor implements NestInterceptor {
    constructor(
        private readonly getUserById: GetUserByIdUseCase,
        private readonly getUserLinkCount: GetUserLinkCountUseCase,
    ) { }

    async intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const user = request["user"]
        const userFromDb = await this.getUserById.execute(user["id"])
        const totalLink = await this.getUserLinkCount.execute(user["id"]) + 1

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
