import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { LinkEntity } from './entities/links.entity';
import { LinkController } from './links.controller';
import { LINK_CREATION_PORT } from './application/link-creation.port';
import { CreateLinksUseCase } from './application/use-cases/create-links.use-case';
import { TypeOrmLinkCreationAdapter } from './infrastructure/typeorm-link-creation.adapter';
import { LINK_QUERY_PORT } from './application/link-query.port';
import { GetLinkOrdersUseCase } from './application/use-cases/get-link-orders.use-case';
import { GetLinkSummaryUseCase } from './application/use-cases/get-link-summary.use-case';
import { TypeOrmLinkQueryAdapter } from './infrastructure/typeorm-link-query.adapter';
import { GetLinksUseCase } from './application/use-cases/get-links.use-case';
import { LINK_MUTATION_PORT } from './application/link-mutation.port';
import {
  CreatePublicTiktokLinkUseCase,
  DeleteLinksByPageUseCase,
  DeleteLinksByTiktokUseCase,
  DeleteLinkUseCase,
  DeleteLinksUseCase,
  GetLinkByIdUseCase,
  GetUserLinkCountAfterStatusChangeUseCase,
  GetUserLinkCountUseCase,
  RefetchLinkCommentsUseCase,
  UpdateLinkUseCase,
} from './application/use-cases/manage-link.use-cases';
import { TypeOrmLinkMutationAdapter } from './infrastructure/typeorm-link-mutation.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([LinkEntity]), UserModule],
  controllers: [LinkController],
  providers: [
    CreateLinksUseCase,
    GetLinkOrdersUseCase,
    GetLinkSummaryUseCase,
    GetLinksUseCase,
    UpdateLinkUseCase,
    DeleteLinkUseCase,
    GetLinkByIdUseCase,
    RefetchLinkCommentsUseCase,
    DeleteLinksUseCase,
    CreatePublicTiktokLinkUseCase,
    GetUserLinkCountUseCase,
    GetUserLinkCountAfterStatusChangeUseCase,
    DeleteLinksByPageUseCase,
    DeleteLinksByTiktokUseCase,
    TypeOrmLinkCreationAdapter,
    TypeOrmLinkQueryAdapter,
    TypeOrmLinkMutationAdapter,
    { provide: LINK_CREATION_PORT, useExisting: TypeOrmLinkCreationAdapter },
    { provide: LINK_QUERY_PORT, useExisting: TypeOrmLinkQueryAdapter },
    { provide: LINK_MUTATION_PORT, useExisting: TypeOrmLinkMutationAdapter },
  ],
  exports: [
    GetUserLinkCountUseCase,
    GetUserLinkCountAfterStatusChangeUseCase,
    DeleteLinksByPageUseCase,
    DeleteLinksByTiktokUseCase,
  ],
})
export class LinkModule { }
