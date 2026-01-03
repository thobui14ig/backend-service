import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { Request } from 'express';
import { getUser } from 'src/common/utils/user';
import { CreateLinkDTO } from './dto/create-link.dto';
import { UpdateLinkDTO } from './dto/update-link.dto';
import { HideBy, LinkStatus } from './entities/links.entity';
import { CheckLimitLinkUserWhenAddLinkInterceptor } from './interceptors/handle-check-limit-link-user-when-add-link.interceptor';
import { CheckLimitLinkUserWhenUpdateMultipleLinkInterceptor } from './interceptors/handle-check-limit-link-user-when-update-multiple-link.interceptor';
import { LinkService } from './links.service';
import { BodyLinkQuery, IGetLinkDeleted, ISettingLinkDto } from './links.service.i';

@Controller('links')
export class LinkController {
  constructor(private readonly linkService: LinkService) { }

  @Post()
  @UseInterceptors(CheckLimitLinkUserWhenAddLinkInterceptor)
  create(@Req() req: Request, @Body() createLinkDto: CreateLinkDTO) {
    const user = getUser(req);

    return this.linkService.create({
      ...createLinkDto,
      userId: user.id,
    });
  }

  @Get('/:id')
  getUser(@Param('id') id: number) {
    return this.linkService.getOne(id);
  }

  @Post('/query')
  getLinks(@Req() req: Request, @Body() body: BodyLinkQuery, @Query('isFilter') isFilter: number, @Query('limit') limit: number, @Query('offset') offset: number) {
    const user = getUser(req);

    return this.linkService.getAll(body, user.level, user.id, !!Number(isFilter), limit, offset);
  }

  @Put()
  updateLink(@Req() req: Request, @Body() updateLinkDto: UpdateLinkDTO) {
    const user = getUser(req);
    return this.linkService.update(updateLinkDto, user.level, user.id);
  }

  @Delete('/:id')
  deleteLink(@Param('id') id: number, @Req() req: Request,) {
    const user = getUser(req);
    return this.linkService.delete(id, user.level, user.id);
  }
}
