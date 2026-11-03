import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ProcessDTO } from '../../dto/process.dto';
import { CheckLimitLinkUserWhenEditLinkInterceptor } from '../../interceptors/handle-check-limit-link-user-when-edit-link.interceptor';
import { UpdateLinkProcessUseCase } from '../../application/use-cases/update-link-process.use-case';

@Controller('monitoring')
export class MonitoringController {
  constructor(
    private readonly updateLinkProcess: UpdateLinkProcessUseCase,
  ) {}

  @Post('/process')
  @UseInterceptors(CheckLimitLinkUserWhenEditLinkInterceptor)
  updateProcess(@Body() processDTO: ProcessDTO) {
    return this.updateLinkProcess.execute(processDTO);
  }
}
