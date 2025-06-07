import { Controller } from "@nestjs/common"
import { UserInfoService } from "./user-info.service"

@Controller("user-infos")
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) {}
}
