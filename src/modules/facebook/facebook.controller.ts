import { Body, Controller, Post } from "@nestjs/common";
import { FacebookService } from "./facebook.service";
import { Public } from "src/common/guard/guard";
@Public()
@Controller('facebook')
export class FacebookController {
  constructor(private readonly facebookService: FacebookService) { }

  @Post('get-info')
  getInfo(@Body() body: { url: string }) {
    return this.facebookService.getInfoLink(body.url)
  }

  @Post('get-comment')
  getComment(@Body() body: { url: string }) {
    return this.facebookService.getComment(body.url)
  }
}