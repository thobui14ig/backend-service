import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { TokenEntity, TokenHandle, TokenStatus, TokenType } from './entities/token.entity';
import { DataSource, In, IsNull, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FacebookService } from '../facebook/facebook.service';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(TokenEntity)
    private repo: Repository<TokenEntity>,
    @Inject(forwardRef(() => FacebookService))
    private facebookService: FacebookService,
    private connection: DataSource,
  ) { }

  handleCookie(rawCookie) {
    // Danh sách các key cookie cần giữ lại và theo thứ tự mong muốn
    const keysOrder = ['fr', 'c_user', 'datr', 'sb', 'presence', 'wd', 'xs', 'ps_n', 'ps_l'];

    // Chuyển cookie thành object
    const cookieObj = Object.fromEntries(
      rawCookie.split('; ').map(pair => {
        const [key, ...val] = pair.split('=');
        return [key, val.join('=')];
      })
    );

    // Lọc và sắp xếp cookie
    const filteredSortedCookie = keysOrder
      .filter(key => cookieObj[key] !== undefined)
      .map(key => `${key}=${cookieObj[key]}`)
      .join('; ');

    return filteredSortedCookie
  }

  async create(params: CreateTokenDto) {
    //chưa code trường hợp có cookie
    const tokenValid = [];
    const tokenInValid = [];
    const type = params.type

    for (const item of params.tokens) {
      let token = item;

      const isExit = (await this.repo.findOne({
        where: {
          tokenValue: token,
        },
      }))
        ? true
        : false;

      if (!isExit) {
        tokenValid.push({
          tokenValue: token,
          tokenValueV1: token,
          cookie: params.cookie,
          type
        });
        continue;
      }

      tokenInValid.push(token);
    }

    await this.repo.save(tokenValid);

    throw new HttpException(
      `Thêm thành công ${tokenValid.length}${tokenInValid.length > 0 ? `, Token không hợp lệ ${tokenInValid.length}: [${tokenInValid.join(',')}]` : ''}`,
      HttpStatus.OK,
    );
  }

  findAll() {
    return this.repo.find({
      order: {
        id: 'desc',
      },
    });
  }

  findOne(id: number) {
    return this.repo.findOne({
      where: {
        id,
      },
    });
  }

  update(id: number, updateTokenDto: UpdateTokenDto) {
    return `This action updates a #${id} token`;
  }

  remove(id: number) {
    return this.connection.transaction(async (manager) => {
      const record = await manager
        .getRepository(TokenEntity)
        .createQueryBuilder("e")
        .setLock("pessimistic_write")
        .where("e.id = :id", { id })
        .getOneOrFail();


      await manager.remove(record);
    });
  }

  async getTokenCrawCmtActiveFromDb(): Promise<TokenEntity> {
    const tokens = await this.repo.find({
      where: {
        status: In([TokenStatus.ACTIVE]),
        tokenValueV1: Not(IsNull()),
        type: TokenHandle.CRAWL_CMT
      }
    })

    const randomIndex = Math.floor(Math.random() * tokens.length);
    const randomToken = tokens[randomIndex];

    return randomToken
  }

  async getTokenGetInfoActiveFromDb(): Promise<TokenEntity> {
    const tokens = await this.repo.find({
      where: {
        status: In([TokenStatus.ACTIVE]),
        tokenValueV1: Not(IsNull()),
        type: TokenHandle.GET_INFO
      }
    })

    const randomIndex = Math.floor(Math.random() * tokens.length);
    const randomToken = tokens[randomIndex];

    return randomToken
  }

  updateStatusToken(token: TokenEntity, status: TokenStatus) {
    console.log("🚀 ~ updateTokenDie ~ token:", token)
    return this.repo.save({ ...token, status })
  }

}
