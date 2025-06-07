import { forwardRef, Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { UserInfoModule } from "../user-info/user-info.module"
import { AccountController } from "./account.controller"
import { AccountService } from "./account.service"
import { Account } from "./entities/account.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Account]), forwardRef(() => UserInfoModule)],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService]
})
export class UserModule {}
