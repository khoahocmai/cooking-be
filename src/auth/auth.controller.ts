import { AccountPayload } from "@/constants/types"
import { Public } from "@/decorator/customize"
import responses from "@/helpers/responses"
import { ZodValidationPipe } from "@/middlewares/custom-zod-validation-filter"
import { BaseResponseWithDataType, UUIDParamRequest, UUIDParamRequestType } from "@/schemas/root.validation"
import { Body, Controller, Get, Param, Post, Req, Res, UseGuards, UsePipes } from "@nestjs/common"
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse
} from "@nestjs/swagger"
import { Request as ExpressRequest, Response } from "express"
import { AuthService } from "./auth.service"
import {
  ActiveAccountRequest,
  ActiveAccountRequestType,
  ChangePasswordRequest,
  ChangePasswordRequestType,
  LoginResponseType,
  ReactiveAccountRequestType,
  RegisterRequest,
  RegisterRequestType,
  RegisterResponseType,
  RequestForgotPasswordRequest,
  RequestForgotPasswordRequestType,
  ResetForgotPasswordRequest,
  ResetForgotPasswordRequestType
} from "./auth.validation"
import {
  ActiveAccountDto,
  ChangePasswordDto,
  ControllerActiveResponseDto,
  ControllerLoginResponseDto,
  ControllerRegisterDto,
  LoginRequestDto,
  ReactiveAccountDto,
  RegisterDto,
  RequestForgotPasswordDto,
  ResetForgotPasswordDto
} from "./dto/auth.dto"
import { GoogleAuthGuard } from "./guards/google-auth.guard"
import { LocalAuthGuard } from "./guards/local-auth.guard"

@ApiBearerAuth("JWT-auth")
@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @Public()
  @ApiOperation({ summary: "Login with email/username and password" })
  @ApiBody({ type: LoginRequestDto })
  @ApiOkResponse({
    description: "Login successfully",
    type: ControllerLoginResponseDto
  })
  @ApiUnauthorizedResponse({
    description: "Wrong email/username or password | Account is not activate | Account is banned"
  })
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: ExpressRequest): Promise<LoginResponseType> {
    const user = req.user as AccountPayload
    const response = await this.authService.login(user)
    return responses.response200OK("Login successfully", response)
  }

  @Post("register")
  @Public()
  @ApiOperation({ summary: "Register account" })
  @ApiBody({ type: RegisterDto })
  @ApiOkResponse({ description: "Please check your email to get the activation code", type: ControllerRegisterDto })
  @ApiBadRequestResponse({ description: "Role is not valid" })
  @ApiConflictResponse({ description: "Email is already in use | Username is already in use" })
  @UsePipes(new ZodValidationPipe(RegisterRequest))
  async register(@Body() data: RegisterRequestType): Promise<RegisterResponseType> {
    const response = await this.authService.register(data)
    return responses.response200OK("Please check your email to get the activation code", response)
  }

  @Post("active")
  @Public()
  @ApiOperation({ summary: "Active account" })
  @ApiBody({ type: ActiveAccountDto })
  @ApiOkResponse({ description: "Account is activate successfully", type: ControllerActiveResponseDto })
  @ApiBadRequestResponse({ description: "OTP is expired or not correct" })
  async activeAccount(
    @Body(new ZodValidationPipe(ActiveAccountRequest)) data: ActiveAccountRequestType
  ): Promise<LoginResponseType> {
    const response = await this.authService.handleActive(data)
    return responses.response200OK("Account is activate successfully", response)
  }

  @Post("request-active")
  @Public()
  @ApiOperation({ summary: "Request for active account" })
  @ApiBody({ type: ReactiveAccountDto })
  @ApiOkResponse({ description: "Please check your email to get the activation code" })
  @ApiBadRequestResponse({ description: "Account not found or has been deleted" })
  @ApiConflictResponse({ description: "Account is already activated" })
  async requestActive(@Body() data: ReactiveAccountRequestType): Promise<BaseResponseWithDataType> {
    const response = await this.authService.requestActive(data.email)
    return responses.response200OK(response)
  }

  // @Post("retry-active")
  // @Public()
  // @ApiOperation({ summary: "Retry-active account" })
  // @ApiParam({ name: "id", required: true, type: "string", description: "Id of account" })
  // @ApiOkResponse({ description: "Please check your email to get the activation code" })
  // @ApiBadRequestResponse({ description: "Account not found or has been deleted" })
  // @ApiConflictResponse({ description: "Account is already activated" })
  // async retryActive(
  //   @Param("id", new ZodValidationPipe(UUIDParamRequest)) id: UUIDParamRequestType
  // ): Promise<BaseResponseWithDataType> {
  //   const response = await this.authService.retryActive(id)
  //   return responses.response200OK(response)
  // }

  @Post("forgot-password/request")
  @Public()
  @ApiOperation({ summary: "Request password reset when user forgot password", operationId: "requestForgotPassword" })
  @ApiBody({ type: RequestForgotPasswordDto })
  @ApiOkResponse({ description: "Please check your email to get the new password" })
  @ApiBadRequestResponse({ description: "Account not found" })
  @UsePipes(new ZodValidationPipe(RequestForgotPasswordRequest))
  async requestForgotPassword(@Body() data: RequestForgotPasswordRequestType): Promise<BaseResponseWithDataType> {
    const response = await this.authService.requestForgotPassword(data.email)
    return responses.response200OK(response)
  }

  @Post("forgot-password/reset")
  @Public()
  @ApiOperation({ summary: "Reset password with verification code", operationId: "resetForgotPassword" })
  @ApiBody({ type: ResetForgotPasswordDto })
  @ApiOkResponse({ description: "Password changed successfully" })
  @ApiBadRequestResponse({ description: "Password and confirm password do not match" })
  @ApiNotFoundResponse({ description: "Account not found" })
  @ApiNotFoundResponse({ description: "Code is expired" })
  @UsePipes(new ZodValidationPipe(ResetForgotPasswordRequest))
  async resetForgotPassword(@Body() data: ResetForgotPasswordRequestType): Promise<BaseResponseWithDataType> {
    const response = await this.authService.resetForgotPassword(data)
    return responses.response200OK(response)
  }

  @Post("change-password")
  @ApiOperation({ summary: "Change password", operationId: "changePassword" })
  @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({ description: "Password changed successfully" })
  @ApiBadRequestResponse({
    description: "Account is not active | Old password is incorrect | Password and confirm password do not match"
  })
  @ApiNotFoundResponse({ description: "Account is not found" })
  async changePassword(
    @Req() request: ExpressRequest,
    @Body(new ZodValidationPipe(ChangePasswordRequest)) data: ChangePasswordRequestType
  ): Promise<BaseResponseWithDataType> {
    const user = request.user as AccountPayload
    const response = await this.authService.changePassword(user, data)
    return responses.response200OK(response)
  }

  @Post("logout")
  @ApiOperation({ summary: "Logout" })
  @ApiOkResponse({ description: "Logout successfully" })
  @ApiUnauthorizedResponse({ description: "Invalid token" })
  async logout(@Req() request: ExpressRequest): Promise<BaseResponseWithDataType> {
    const user = request.user as AccountPayload
    const response = await this.authService.logout(user)
    return responses.response200OK(response)
  }

  @Get("google/login")
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Login with google" })
  @ApiQuery({ name: "deviceId", required: false, type: String, description: "Unique Device ID" })
  @ApiOkResponse({ description: "Login with google" })
  @ApiBadRequestResponse({ description: "Account is not active" })
  async googleLogin() {}

  @Get("google/callback")
  @Public()
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Login with google" })
  @ApiOkResponse({ description: "Login with google" })
  @ApiBadRequestResponse({ description: "Account is not active" })
  async googleCallback(@Req() req: ExpressRequest, @Res() res: Response): Promise<void> {
    const user = req.user as AccountPayload
    const response = await this.authService.ggLogin(user)
    return res.redirect(
      process.env.CLIENT_URL_GG_LOGIN +
        "?accessToken=" +
        response.accessToken +
        "&refreshToken=" +
        response.refreshToken
    )
  }
}
