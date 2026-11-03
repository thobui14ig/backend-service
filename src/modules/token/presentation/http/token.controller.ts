import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Role, Roles } from '../../../../common/decorators/roles.decorator';
import { CreateTokenDto } from '../../dto/create-token.dto';
import { UpdateTokenDto } from '../../dto/update-token.dto';
import {
  CreateTokensUseCase,
  DeleteTokenUseCase,
  GetTokenUseCase,
  ListTokensUseCase,
  UpdateTokenUseCase,
} from '../../application/use-cases/manage-tokens.use-cases';

@Controller('tokens')
@Roles(Role.ADMIN)
export class TokenController {
  constructor(
    private readonly createTokens: CreateTokensUseCase,
    private readonly listTokens: ListTokensUseCase,
    private readonly getToken: GetTokenUseCase,
    private readonly updateToken: UpdateTokenUseCase,
    private readonly deleteToken: DeleteTokenUseCase,
  ) {}

  @Post()
  create(@Body() createTokenDto: CreateTokenDto) {
    return this.createTokens.execute(createTokenDto);
  }

  @Get()
  findAll() {
    return this.listTokens.execute();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getToken.execute(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTokenDto: UpdateTokenDto) {
    return this.updateToken.execute(+id, updateTokenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteToken.execute(+id);
  }
}
