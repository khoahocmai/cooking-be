import { Controller, Get } from "@nestjs/common"
import { AppService } from "./app.service"
import { Public } from "./decorator/customize"
import responses from "./helpers/responses"

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("health")
  @Public()
  checkHealth() {
    const response = this.appService.checkHealth()
    return responses.response200OK(response)
  }
}
