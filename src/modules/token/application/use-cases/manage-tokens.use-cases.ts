import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { TOKEN_PORT, TokenPort } from '../token.port';
import { CreateTokenDto } from '../../dto/create-token.dto';
import { TokenEntity } from '../../entities/token.entity';
import { UpdateTokenDto } from '../../dto/update-token.dto';

@Injectable()
export class CreateTokensUseCase {
  constructor(@Inject(TOKEN_PORT) private readonly tokens: TokenPort) {}

  async execute(params: CreateTokenDto) {
    const valid: Array<Partial<TokenEntity>> = [];
    const invalid: string[] = [];

    for (const tokenValue of params.tokens) {
      if (await this.tokens.exists(tokenValue)) {
        invalid.push(tokenValue);
      } else {
        valid.push({
          tokenValue,
          tokenValueV1: tokenValue,
          cookie: params.cookie,
          type: params.type,
        });
      }
    }

    await this.tokens.saveMany(valid);
    throw new HttpException(
      `Thêm thành công ${valid.length}${
        invalid.length > 0
          ? `, Token không hợp lệ ${invalid.length}: [${invalid.join(',')}]`
          : ''
      }`,
      HttpStatus.OK,
    );
  }
}

@Injectable()
export class ListTokensUseCase {
  constructor(@Inject(TOKEN_PORT) private readonly tokens: TokenPort) {}

  execute() {
    return this.tokens.findAll();
  }
}

@Injectable()
export class GetTokenUseCase {
  constructor(@Inject(TOKEN_PORT) private readonly tokens: TokenPort) {}

  execute(id: number) {
    return this.tokens.findOne(id);
  }
}

@Injectable()
export class UpdateTokenUseCase {
  execute(id: number, _input: UpdateTokenDto) {
    return `This action updates a #${id} token`;
  }
}

@Injectable()
export class DeleteTokenUseCase {
  constructor(@Inject(TOKEN_PORT) private readonly tokens: TokenPort) {}

  execute(id: number) {
    return this.tokens.remove(id);
  }
}
