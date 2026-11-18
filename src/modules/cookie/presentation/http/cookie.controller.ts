import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from "@nestjs/common";
import { getUser } from "../../../../common/utils/user";
import { Request } from "express";
import { LEVEL } from "../../../user/entities/user.entity";
import { CreateCookiesUseCase } from "../../application/use-cases/create-cookies.use-case";
import { DeleteCookieUseCase } from "../../application/use-cases/delete-cookie.use-case";
import { GetCookieUseCase } from "../../application/use-cases/get-cookie.use-case";
import { ListCookiesUseCase } from "../../application/use-cases/list-cookies.use-case";
import { UpdateCookieUseCase } from "../../application/use-cases/update-cookie.use-case";
import { CreateCookieDto } from "../../dto/create-cookie.dto";
import { UpdateCookieDto } from "../../dto/update-cookie.dto";

@Controller("cookies")
// @Roles(Role.ADMIN)
export class CookieController {
  constructor(
    private readonly createCookies: CreateCookiesUseCase,
    private readonly listCookies: ListCookiesUseCase,
    private readonly getCookie: GetCookieUseCase,
    private readonly updateCookie: UpdateCookieUseCase,
    private readonly deleteCookie: DeleteCookieUseCase,
  ) {}

  @Post()
  create(@Body() createCookieDto: CreateCookieDto, @Req() req: Request) {
    const user = getUser(req);

    return this.createCookies.execute(
      { ...createCookieDto, createdBy: user.id },
      user.level === LEVEL.USER || user.level === LEVEL.USER_PRIVATE,
    );
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = getUser(req);
    return this.listCookies.execute(user.level === LEVEL.USER, user.id);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.getCookie.execute(+id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateCookieDto: UpdateCookieDto) {
    return this.updateCookie.execute(+id, {
      status: updateCookieDto.status,
    });
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.deleteCookie.execute(+id);
  }
}
