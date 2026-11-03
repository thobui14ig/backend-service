import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CookieController } from './presentation/http/cookie.controller';
import { CookieEntity } from './entities/cookie.entity';
import { COOKIE_EVENT_PORT, COOKIE_PORT } from './application/cookie.port';
import { CreateCookiesUseCase } from './application/use-cases/create-cookies.use-case';
import { DeleteCookieUseCase } from './application/use-cases/delete-cookie.use-case';
import { GetCookieUseCase } from './application/use-cases/get-cookie.use-case';
import { ListCookiesUseCase } from './application/use-cases/list-cookies.use-case';
import { UpdateCookieUseCase } from './application/use-cases/update-cookie.use-case';
import { TypeOrmCookieAdapter } from './infrastructure/typeorm-cookie.adapter';
import { EventEmitterCookieAdapter } from './infrastructure/event-emitter-cookie.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([CookieEntity])],
  controllers: [CookieController],
  providers: [
    CreateCookiesUseCase,
    ListCookiesUseCase,
    GetCookieUseCase,
    UpdateCookieUseCase,
    DeleteCookieUseCase,
    TypeOrmCookieAdapter,
    EventEmitterCookieAdapter,
    { provide: COOKIE_PORT, useExisting: TypeOrmCookieAdapter },
    { provide: COOKIE_EVENT_PORT, useExisting: EventEmitterCookieAdapter },
  ],
})
export class CookieModule { }
