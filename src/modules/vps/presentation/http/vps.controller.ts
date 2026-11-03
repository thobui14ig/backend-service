import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CreateVpsDto } from '../../dto/create-page.dto';
import { Role, Roles } from '../../../../common/decorators/roles.decorator';
import {
  CreateVpsUseCase,
  DeleteVpsUseCase,
  ListVpsUseCase,
  RestartVpsUseCase,
} from '../../application/use-cases/manage-vps.use-cases';

@Controller("vps")
@Roles(Role.ADMIN)
export class VpsController {
  constructor(
    private readonly createVps: CreateVpsUseCase,
    private readonly listVps: ListVpsUseCase,
    private readonly deleteVps: DeleteVpsUseCase,
    private readonly restartVpsUseCase: RestartVpsUseCase,
  ) {}

  @Get()
  getAll() {
    return this.listVps.execute();
  }

  @Post()
  create(@Body() body: CreateVpsDto) {
    return this.createVps.execute(body);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.deleteVps.execute(+id);
  }

  @Post(":id/restart")
  restartVps(@Param("id", ParseIntPipe) id: number) {
    return this.restartVpsUseCase.execute(id);
  }
}
