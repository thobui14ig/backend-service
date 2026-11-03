import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenEntity } from './entities/token.entity';
import { TokenController } from './presentation/http/token.controller';
import { TOKEN_PORT } from './application/token.port';
import {
  CreateTokensUseCase,
  DeleteTokenUseCase,
  GetTokenUseCase,
  ListTokensUseCase,
  UpdateTokenUseCase,
} from './application/use-cases/manage-tokens.use-cases';
import { TypeOrmTokenAdapter } from './infrastructure/typeorm-token.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([TokenEntity])],
  controllers: [TokenController],
  providers: [
    CreateTokensUseCase,
    DeleteTokenUseCase,
    GetTokenUseCase,
    ListTokensUseCase,
    UpdateTokenUseCase,
    TypeOrmTokenAdapter,
    { provide: TOKEN_PORT, useExisting: TypeOrmTokenAdapter },
  ],
})
export class TokenModule { }
