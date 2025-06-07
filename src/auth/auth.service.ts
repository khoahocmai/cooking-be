import { JWTResponse, AccountPayload } from "@/constants/types"
import { comparePasswordHelper } from "@/helpers/utils"
import { AccountService } from "@/modules/account/account.service"
import { Account } from "@/modules/account/entities/account.entity"
import { CACHE_MANAGER } from "@nestjs/cache-manager"
import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { JwtService } from "@nestjs/jwt"
import { Cache } from "cache-manager"
import ms from "ms"
import {
  ActiveAccountRequestType,
  ChangePasswordRequestType,
  RegisterRequestType,
  ResetForgotPasswordRequestType
} from "./auth.validation"
import { ActiveAccountDto, RegisterDto, ResetForgotPasswordDto } from "./dto/auth.dto"

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => AccountService))
    private accountService: AccountService,
    private jwtService: JwtService,
    private configService: ConfigService,

    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async validateUserLocalStrategy(loginKey: string, password: string): Promise<Account> {
    const condition = loginKey.includes("@")
      ? { email: loginKey } // Nếu có '@', tìm theo email
      : { username: loginKey }
    const user = await this.accountService.findUserByCondition(condition)
    const isValidPassword = await comparePasswordHelper(password, user?.password || "nothing")
    if (!user || !isValidPassword) return null
    return user
  } // Xác thực thông tin trả về user

  async login(user: AccountPayload): Promise<JWTResponse> {
    const JWTResponse: JWTResponse = await this.handlePayload(user)
    const expiresRefreshInMs = ms(this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRED") as ms.StringValue)

    await this.cacheManager.set(`${user.id}`, JWTResponse.refreshToken, expiresRefreshInMs / 1000)

    return JWTResponse
  } // Xác thực thông tin người dùng cho web

  private handlePayload(user: AccountPayload): Promise<JWTResponse> {
    const payload = { id: user.id, email: user.email, role: user.role }
    const expiresAccessInMs = ms(this.configService.get<string>("JWT_ACCESS_TOKEN_EXPIRED") as ms.StringValue) // Đơn vị ms
    const expiresRefreshInMs = ms(this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRED") as ms.StringValue) // Đơn vị ms

    const JWTResponse: JWTResponse = {
      account: {
        id: user.id,
        email: user.email,
        role: user.role
      },
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
        expiresIn: this.configService.get<string>("JWT_ACCESS_TOKEN_EXPIRED")
      }),
      expiresAccess: new Date(Date.now() + expiresAccessInMs),
      refreshToken: this.jwtService.sign(payload, {
        secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
        expiresIn: this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRED")
      }),
      expiresRefresh: new Date(Date.now() + expiresRefreshInMs)
    }

    return Promise.resolve(JWTResponse)
  } // Tạo payload cho JWT

  async register(registerDto: RegisterRequestType): Promise<string> {
    const dataRequest: RegisterDto = {
      email: registerDto.email,
      username: registerDto.username,
      password: registerDto.password,
      role: registerDto.role
    }
    const account = await this.accountService.register(dataRequest)
    return account.id
  } // Đăng ký tài khoản

  async handleActive(data: ActiveAccountRequestType): Promise<JWTResponse> {
    const dataRequest: ActiveAccountDto = {
      id: data.id,
      code: data.code
    }
    const user = await this.accountService.handleActive(dataRequest)
    return this.login(user)
  } // Kích hoạt tài khoản

  async requestActive(email: string): Promise<string> {
    return await this.accountService.requestActive(email)
  } // Gửi yêu cầu kích hoạt

  async retryActive(userId: string): Promise<string> {
    return await this.accountService.retryActive(userId)
  } // Gửi lại mã kích hoạt

  async requestForgotPassword(email: string): Promise<string> {
    return await this.accountService.requestForgotPassword(email)
  } // Yêu cầu thay đổi mật khẩu khi quên mật khẩu

  async resetForgotPassword(data: ResetForgotPasswordRequestType): Promise<string> {
    const dataRequest: ResetForgotPasswordDto = {
      code: data.code,
      password: data.password,
      confirmPassword: data.confirmPassword,
      email: data.email
    }
    return await this.accountService.resetForgotPassword(dataRequest)
  } // Thay đổi mật khẩu khi quên mật khẩu

  async changePassword(user: AccountPayload, data: ChangePasswordRequestType): Promise<string> {
    return await this.accountService.changePassword(user, data)
  } // Thay đổi mật khẩu của người dùng

  async logout(user: AccountPayload): Promise<string> {
    await this.cacheManager.del(`${user.id}`)
    return "Logout successfully"
  } // Đăng xuất người dùng

  async ggLogin(user: any): Promise<JWTResponse> {
    const JWTResponse: JWTResponse = await this.handlePayload(user)
    const expiresRefreshInMs = ms(this.configService.get<string>("JWT_REFRESH_TOKEN_EXPIRED") as ms.StringValue)
    await this.cacheManager.set(`${user.id}`, JWTResponse.refreshToken, expiresRefreshInMs / 1000)
    return JWTResponse
  } // Google login

  async validateGoogleUser(email: string, firstName: string, lastName: string, avatarUrl: string): Promise<Account> {
    const user = await this.accountService.findUserByEmail(email)
    if (user) {
      return user
    }
    return await this.accountService.createUserGGLogin(email, firstName, lastName, avatarUrl)
  } // Xác thực người dùng Google và tạo tài khoản nếu chưa tồn tại
}
