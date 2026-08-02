// src/logging.interceptor.ts
import {
    CallHandler,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class CheckVipInterceptor implements NestInterceptor {
    constructor(private userService: UserService,) { }

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
        return next.handle()
    }
}
