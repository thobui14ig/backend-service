import { Body, Controller, Post } from "@nestjs/common";
import { GetFacebookCommentsUseCase } from './application/use-cases/get-facebook-comments.use-case';
import { GetFacebookLinkInfoUseCase } from './application/use-cases/get-facebook-link-info.use-case';
import { Public } from "src/common/guard/guard";
@Public()
@Controller('facebook')
export class FacebookController {
  constructor(
    private readonly getLinkInfo: GetFacebookLinkInfoUseCase,
    private readonly getComments: GetFacebookCommentsUseCase,
  ) {}

  @Post('get-info')
  getInfo(@Body() body: { url: string }) {
    return this.getLinkInfo.execute(body.url)
  }

  @Post('get-comment')
  getComment(@Body() body: { url: string }) {
    return this.getComments.execute(body.url)
  }
}