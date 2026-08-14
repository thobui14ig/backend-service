import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res
} from '@nestjs/common';
import { Request, Response } from 'express';

import { Public } from 'src/common/guard/guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { getSidFromRequest } from 'src/common/utils/auth';
import { Throttle } from '@nestjs/throttler';

@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  @Throttle({
    default: {
      limit: 10,
      ttl: 60_000,
    },
  })
  async signIn(
    @Body() signInDto: LoginDto,
    @Res()
    res: Response,
  ) {
    const response = await this.authService.signIn(
      (signInDto.username).trim().toLowerCase(),
      signInDto.password,
    );

    res.setHeader('Set-Cookie', [
      `sid=${response.sid}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 365 * 10}`
    ]);

    delete response.token;
    return res.send(response);
  }
}
