// src/logging.interceptor.ts
import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { EnsureUserHasPlanUseCase } from 'src/modules/user/application/use-cases/ensure-user-has-plan.use-case';

@Injectable()
export class CheckVipInterceptor implements NestInterceptor {
    constructor(private readonly ensureUserHasPlan: EnsureUserHasPlanUseCase) { }

    async intercept(context: ExecutionContext, next: CallHandler) {
        const request = context.switchToHttp().getRequest();
        const user = request["user"]
        await this.ensureUserHasPlan.execute(user["id"]);
        return next.handle()
    }
}
