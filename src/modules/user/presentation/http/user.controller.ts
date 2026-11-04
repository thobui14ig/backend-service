import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { getUser } from "../../../../common/utils/user";
import { UpdateUserDto } from "../../dto/update-user.dto";
import { Role, Roles } from "../../../../common/decorators/roles.decorator";
import { Public } from "../../../../common/guard/guard";
import { Throttle } from "@nestjs/throttler";
import { LEVEL } from "../../entities/user.entity";
import { CreateUserDto } from "../../dto/create-user.dto";
import { CreateUserUseCase } from "../../application/use-cases/create-user.use-case";
import {
  ChangeUserPasswordUseCase,
  DeleteUserUseCase,
  GetSubUsersUseCase,
  GetUserByIdUseCase,
  GetUserInfoUseCase,
  GetUsersUseCase,
  UpdateUserUseCase,
} from "../../application/use-cases/manage-users.use-cases";
import {
  RenewResellerUserServiceUseCase,
  RenewUserServiceUseCase,
} from "../../application/use-cases/renew-user-service.use-cases";

@Controller("users")
export class UserController {
  constructor(
    private readonly createUser: CreateUserUseCase,
    private readonly getUsersUseCase: GetUsersUseCase,
    private readonly getSubUsersUseCase: GetSubUsersUseCase,
    private readonly getUserInfoUseCase: GetUserInfoUseCase,
    private readonly getUserById: GetUserByIdUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
    private readonly changeUserPassword: ChangeUserPasswordUseCase,
    private readonly renewResellerUser: RenewResellerUserServiceUseCase,
    private readonly renewCurrentUser: RenewUserServiceUseCase,
  ) {}

  @Post()
  @Public()
  @Throttle({
    default: {
      limit: 1,
      ttl: 10_000,
    },
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.createUser.execute({
      ...createUserDto,
      level: LEVEL.USER,
    });
  }

  @Post("sub-user")
  @Throttle({
    default: {
      limit: 1,
      ttl: 10_000,
    },
  })
  createSubUser(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    const user = getUser(req);
    if (user.level !== LEVEL.RESELLER) {
      throw new ForbiddenException("Chỉ Reseller mới được tạo Sub User");
    }

    const input = {
      ...createUserDto,
      level: LEVEL.SUB_USER,
      parentId: user.id,
      totalLink: 100,
      isGetPhone: true,
      isActive: false,
    };
    return this.createUser.execute(input);
  }

  @Get("")
  @Roles(Role.ADMIN)
  getUsers() {
    return this.getUsersUseCase.execute();
  }

  @Get("sub-users")
  getSubUsers(@Req() req: Request) {
    const user = getUser(req);
    return this.getSubUsersUseCase.execute(user.id);
  }

  @Get("/info")
  getUserInfo(@Req() req: Request) {
    const user = getUser(req);

    return this.getUserInfoUseCase.execute(user.id);
  }

  @Get("/:id")
  getUser(@Param("id") id: number) {
    return this.getUserById.execute(id);
  }

  @Put()
  @Roles(Role.ADMIN)
  updateUser(@Body() updateUserDto: UpdateUserDto) {
    return this.updateUserUseCase.execute(updateUserDto);
  }

  @Delete("/:id")
  @Roles(Role.ADMIN)
  deleteUser(@Param("id") id: number) {
    return this.deleteUserUseCase.execute(id);
  }

  @Post("change-pass")
  changePass(@Body() dto: { password: string }, @Req() req: Request) {
    const user = getUser(req);
    return this.changeUserPassword.execute(user.id, dto.password);
  }

  @Post("renew-service")
  renewService(@Body() dto: { userId: number }, @Req() req: Request) {
    const user = getUser(req);
    return this.renewResellerUser.execute(dto.userId, user.id);
  }

  @Post("renew-service-user")
  renewServiceForUser(@Req() req: Request) {
    const user = getUser(req);
    return this.renewCurrentUser.execute(user.id);
  }
}
