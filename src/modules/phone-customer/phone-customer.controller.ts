import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PhoneCustomerService } from './phone-customer.service';
import { IUpdateClick } from './phone-customer.controller.i';

@Controller('phone-customer')
export class PhoneCustomerController {
  constructor(private readonly phoneCustomerService: PhoneCustomerService) { }

  @Get()
  findAll() {
    return this.phoneCustomerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phoneCustomerService.findOne(+id);
  }

  @Post('/update-click')
  updateClick(@Body() body: IUpdateClick) {
    return this.phoneCustomerService.updateClick(body)
  }
}
