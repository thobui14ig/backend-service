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

@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(
    @Body() signInDto: LoginDto,
    @Res()
    res: Response,
  ) {
    const response = await this.authService.signIn(
      (signInDto.username).trim().toLowerCase(),
      signInDto.password,
    );

    res.setHeader('Set-Cookie', [`HttpOnly; Path=/`, `sid=${response.sid}; HttpOnly; Path=/`]);

    delete response.token;
    return res.send(response);
  }

  @Post('refresh-token')
  async refreshToken(
    @Body() body: { refreshToken: string },
    @Req() request: Request,
    @Res()
    res: Response,
  ) {
    const sid = getSidFromRequest(request)
    return this.authService.refreshToken(sid, res);
  }
}
