import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { Role, Roles } from '../../../../common/decorators/roles.decorator';
import { CreateProxyDto } from '../../dto/create-proxy.dto';
import { UpdateProxyDto } from '../../dto/update-proxy.dto';
import { IGetProxy } from '../../proxy.controller.i';
import {
  CreateProxiesUseCase,
  DeleteProxiesUseCase,
  DeleteProxyUseCase,
  GetProxyUseCase,
  ListProxiesUseCase,
  UpdateProxyUseCase,
} from '../../application/use-cases/manage-proxies.use-cases';

@Controller('proxies')
@Roles(Role.ADMIN)
export class ProxyController {
  constructor(
    private readonly createProxies: CreateProxiesUseCase,
    private readonly listProxies: ListProxiesUseCase,
    private readonly getProxy: GetProxyUseCase,
    private readonly updateProxy: UpdateProxyUseCase,
    private readonly deleteProxy: DeleteProxyUseCase,
    private readonly deleteProxies: DeleteProxiesUseCase,
  ) {}

  @Post()
  create(@Body() createProxyDto: CreateProxyDto) {
    return this.createProxies.execute(createProxyDto);
  }

  @Post('get-proxies')
  findAll(@Body() params: IGetProxy) {
    return this.listProxies.execute(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getProxy.execute(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProxyDto: UpdateProxyDto) {
    return this.updateProxy.execute(+id, updateProxyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deleteProxy.execute(+id);
  }

  @Post('delete') 
  deletes(@Body() ids: number[]) {
    return this.deleteProxies.execute(ids);
  }
}
