import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { CreateProxyDto } from './dto/create-proxy.dto';
import { UpdateProxyDto } from './dto/update-proxy.dto';
import { IGetProxy } from './proxy.controller.i';
import { Role, Roles } from 'src/common/decorators/roles.decorator';

@Controller('proxies')
@Roles(Role.ADMIN)
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) { }

  @Post()
  create(@Body() createProxyDto: CreateProxyDto) {
    return this.proxyService.create(createProxyDto);
  }

  @Post('get-proxies')
  findAll(@Body() params: IGetProxy) {
    return this.proxyService.findAll(params);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proxyService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProxyDto: UpdateProxyDto) {
    return this.proxyService.update(+id, updateProxyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proxyService.remove(+id);
  }

  @Post('delete') 
  deletes(@Body() ids: number[]) {
    return this.proxyService.deletes(ids);
  }
}
