import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res
} from '@nestjs/common';
import { Response } from 'express';

import { Public } from 'src/common/guard/guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

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

    res.setHeader('Set-Cookie', [`token=${response.token.accessToken}; HttpOnly; Path=/`]);

    return res.send(response);
  }

  @Post('refresh-token')
  async refreshToken(
    @Body() body: { refreshToken: string },
    @Res()
    res: Response,
  ) {
    const { refreshToken } = body;
    return this.authService.refreshToken(refreshToken, res);
  }
}
