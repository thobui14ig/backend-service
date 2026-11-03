import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Role, Roles } from '../../../../common/decorators/roles.decorator';
import { IUpdateClick } from '../../phone-customer.controller.i';
import {
  GetPhoneCustomerUseCase,
  ListPhoneCustomersUseCase,
  UpdatePhoneCustomerClickUseCase,
} from '../../application/use-cases/manage-phone-customer.use-cases';

@Controller('phone-customer')
@Roles(Role.ADMIN)
export class PhoneCustomerController {
  constructor(
    private readonly listPhoneCustomers: ListPhoneCustomersUseCase,
    private readonly getPhoneCustomer: GetPhoneCustomerUseCase,
    private readonly updatePhoneCustomerClick: UpdatePhoneCustomerClickUseCase,
  ) {}

  @Get()
  findAll() {
    return this.listPhoneCustomers.execute();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getPhoneCustomer.execute(+id);
  }

  @Post('/update-click')
  updateClick(@Body() body: IUpdateClick) {
    return this.updatePhoneCustomerClick.execute(body)
  }
}
