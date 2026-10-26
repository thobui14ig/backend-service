import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Cron, CronExpression } from "@nestjs/schedule";
import * as dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import { RedisService } from "../redis/redis.service";
import { UserEntity } from "../user/entities/user.entity";
import { UserService } from "../user/user.service";

interface IUserFail {
  username: string;
  numberOfTime: number;
  time: string;
}
@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  usersFail: IUserFail[] = [];
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.cleanupExpiredSessions();
  }

  async signIn(username: string, pass: string) {
    const { password, ...user } =
      (await this.usersService.findByEmail(username)) || {};
    const userFail = this.usersFail.find((item) => item.username === username);

    if (
      userFail &&
      userFail.numberOfTime == 2 &&
      dayjs().isBefore(dayjs(userFail.time).add(1, "minute"))
    ) {
      throw new HttpException(`Vui lòng thử lại sau`, HttpStatus.BAD_REQUEST);
    }
    if (userFail && userFail.numberOfTime == 2) {
      this.usersFail = this.usersFail.filter(
        (item) => item.username !== username,
      );
    }

    if (!user || password !== pass) {
      if (userFail) {
        userFail.time = dayjs().format("YYYY-MM-DD HH:mm:ss");
        userFail.numberOfTime = userFail.numberOfTime + 1;
      } else {
        const arg = {
          username: username,
          numberOfTime: 1,
          time: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        };
        this.usersFail.push(arg);
      }

      throw new HttpException(
        `Thông tin đăng nhập không hợp lệ`,
        HttpStatus.BAD_REQUEST,
      );
    }
    this.usersFail = this.usersFail.filter(
      (item) => item.username !== username,
    );
    const isExpireDate =
      dayjs(dayjs(), "DD-MM-YYYY").format("YYYY-MM-DD") >
      dayjs(user.expiredAt, "DD-MM-YYYY").format("YYYY-MM-DD");
    if (isExpireDate) {
      throw new HttpException(`User hết hạn`, HttpStatus.BAD_REQUEST);
    }

    const payload = { ...user };
    const token = await this.createToken(payload);
    const sid = uuidv4();
    await this.redisService.setJson(sid, token);

    return {
      token,
      sid,
      info: {
        ...user,
      },
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async cleanupExpiredSessions(): Promise<void> {
    let deletedSessions = 0;
    const now = Date.now() / 1000;

    try {
      for await (const sid of this.redisService.scanKeys()) {
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(sid)) {
          continue;
        }

        const value = await this.redisService.get(sid);
        if (!value) continue;

        let session: unknown;
        try {
          session = JSON.parse(value);
        } catch {
          continue;
        }

        if (
          session === null ||
          typeof session !== "object" ||
          !("refreshToken" in session) ||
          typeof session.refreshToken !== "string"
        ) {
          continue;
        }

        let payload: unknown;
        try {
          payload = this.jwtService.verify(session.refreshToken, {
            ignoreExpiration: true,
          });
        } catch {
          continue;
        }

        if (
          payload === null ||
          typeof payload !== "object" ||
          !("exp" in payload) ||
          typeof payload.exp !== "number" ||
          payload.exp > now
        ) {
          continue;
        }
        if (await this.redisService.deleteIfValueMatches(sid, value)) {
          deletedSessions++;
        }
      }

      this.logger.log(`Removed ${deletedSessions} expired sessions from Redis`);
    } catch (error) {
      this.logger.error(
        "Failed to clean up expired sessions from Redis",
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  async createToken(payload: Omit<Partial<UserEntity>, "password">) {
    return {
      accessToken: await this.jwtService.signAsync(payload, {
        expiresIn: "1d",
      }),
      refreshToken: await this.jwtService.signAsync(payload, {
        expiresIn: "7d",
      }),
    };
  }

  async refreshToken(sid: string): Promise<Partial<UserEntity>> {
    const dataToken = await this.redisService.get(sid);
    if (!dataToken) {
      throw new UnauthorizedException(
        "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
      );
    }

    let tokenParse: { refreshToken?: string };
    try {
      tokenParse = JSON.parse(dataToken);
    } catch {
      throw new UnauthorizedException(
        "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
      );
    }

    let decodedToken: Partial<UserEntity> & { iat?: number; exp?: number };
    try {
      decodedToken = this.jwtService.verify(tokenParse.refreshToken);
    } catch {
      throw new UnauthorizedException(
        "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
      );
    }

    const { iat, exp, ...payload } = decodedToken;
    const token = await this.createToken(payload);
    await this.redisService.delete(sid);
    await this.redisService.setJson(sid, token);
    return payload;
  }
}
