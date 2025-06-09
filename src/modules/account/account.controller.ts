import { Role, AccountPayload } from "@/constants/types"
import { RequireRole } from "@/decorator/customize"
import responses from "@/helpers/responses"
import { ZodValidationPipe } from "@/middlewares/custom-zod-validation-filter"
import { BaseResponseWithDataType, UUIDParamRequest, UUIDParamRequestType } from "@/schemas/root.validation"
import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger"
import { Request as ExpressRequest } from "express"
import { AccountService } from "./account.service"
import {
  CreateUserRequest,
  CreateUserRequestType,
  GetUserByIdResponseType,
  GetUserProfileResponseType,
  GetUserQueryRequest,
  GetUserQueryRequestType,
  GetUsersResponseType,
  UpdateUserInfoRequest,
  UpdateUserInfoRequestType
} from "./account.validation"
import {
  ControllerGetAllUserResponse,
  ControllerGetProfileResponse,
  ControllerGetUserByIdResponse,
  CreateUserDto,
  UpdateUserDetailDto
} from "./dto/account.dto"

@ApiBearerAuth("JWT-auth")
@ApiTags("Account")
@Controller("accounts")
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @RequireRole([Role.ADMIN])
  @ApiOperation({ summary: "Create a new user | Require Role: Admin" })
  @ApiBody({ type: CreateUserDto })
  @ApiOkResponse({ description: "Create user successfully" })
  @ApiConflictResponse({ description: "Email already exists | Username already exists" })
  async create(
    @Body(new ZodValidationPipe(CreateUserRequest)) dataRequest: CreateUserRequestType
  ): Promise<BaseResponseWithDataType> {
    const dataResponse = await this.accountService.create(dataRequest)
    return responses.response200OK(dataResponse)
  }

  @Get()
  @RequireRole([Role.STAFF, Role.ADMIN])
  @ApiOperation({
    summary:
      "Retrieve a list of user with pagination and keyword filtering by email | Require Role: Salesman, Supporter, Manager, Admin"
  })
  @ApiQuery({ name: "page_index", required: false, type: Number, description: "Page index, default is 1" })
  @ApiQuery({ name: "page_size", required: false, type: Number, description: "Page size, default is 10" })
  @ApiQuery({
    name: "keyword",
    required: false,
    type: String,
    description: "Search keyword for filtering users by email"
  })
  @ApiQuery({
    name: "isDel",
    required: false,
    enum: ["t", "f"],
    description: "Get user is deleted: 't' or not deleted: 'f'. Default is 'f'"
  })
  @ApiOkResponse({
    description: "Successfully retrieved the blog list",
    type: ControllerGetAllUserResponse
  })
  async findAll(
    @Query(new ZodValidationPipe(GetUserQueryRequest)) query: GetUserQueryRequestType,
    @Req() req: ExpressRequest
  ): Promise<GetUsersResponseType> {
    const user = req.user as AccountPayload
    const { page_index = 1, page_size = 10, keyword, isDel } = query
    const response = await this.accountService.findAll(user, page_index, page_size, keyword, isDel)
    return responses.response200OK("Successfully retrieved the blog list", response)
  }

  @Get("profile")
  @ApiOperation({ summary: "Get user logged in profile | Require Role: All", operationId: "getProfile" })
  @ApiOkResponse({ type: ControllerGetProfileResponse, description: "Successfully retrieved the user profile" })
  @ApiNotFoundResponse({ description: "User information is not found" })
  async getProfile(@Req() req: ExpressRequest): Promise<GetUserProfileResponseType> {
    const user = req.user as AccountPayload
    const dataResponse = await this.accountService.getProfile(user.id)
    return responses.response200OK("Successfully retrieved the user profile", dataResponse)
  }

  @Put("profile")
  @ApiOperation({ summary: "Update user detail | Require Role: All", operationId: "updateProfile" })
  @ApiBody({ type: UpdateUserDetailDto })
  @ApiOkResponse({ description: "Update user successfully" })
  @ApiNotFoundResponse({ description: "User detail is not found" })
  async updateProfile(
    @Body(new ZodValidationPipe(UpdateUserInfoRequest)) data: UpdateUserInfoRequestType,
    @Req() req: ExpressRequest
  ): Promise<GetUserProfileResponseType> {
    const user = req.user as AccountPayload
    const response = await this.accountService.updateProfile(user, data)
    return responses.response200OK(response)
  }

  @Put(":userId/handle-ban")
  @RequireRole([Role.ADMIN])
  @ApiOperation({ summary: "Ban a user | Require Role: Admin", operationId: "banUser" })
  @ApiParam({ name: "userId", required: true, type: String, description: "ID of the user to ban" })
  @ApiOkResponse({ description: "User has been banned successfully" })
  async handleBan(
    @Param("userId", new ZodValidationPipe(UUIDParamRequest)) userId: UUIDParamRequestType
  ): Promise<BaseResponseWithDataType> {
    const response = await this.accountService.handleBan(userId)
    return responses.response200OK(response)
  }

  @Get(":id")
  @RequireRole([Role.STAFF, Role.ADMIN])
  @ApiOperation({ summary: "Get user by Id | Require Role: Salesman, Supporter, Manager, Admin" })
  @ApiOkResponse({ type: ControllerGetUserByIdResponse, description: "Successfully retrieved the user information" })
  @ApiNotFoundResponse({ description: "User information is not found" })
  async findOne(@Param("id", new ZodValidationPipe(UUIDParamRequest)) id: string): Promise<GetUserByIdResponseType> {
    const dataResponse = await this.accountService.findOne(id)
    return responses.response200OK("Successfully retrieved the user information", dataResponse)
  }

  @Put(":id")
  @RequireRole([Role.ADMIN])
  @ApiOperation({ summary: "Update user detail | Require Role: Admin" })
  @ApiParam({ name: "id", type: String, description: "User Id" })
  @ApiBody({ type: UpdateUserDetailDto })
  @ApiOkResponse({ description: "Update user successfully" })
  @ApiNotFoundResponse({ description: "User detail is not found" })
  async update(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(UpdateUserInfoRequest)) data: UpdateUserInfoRequestType
  ) {
    const dataResponse = await this.accountService.update(id, data)
    return responses.response200OK(dataResponse)
  }

  @Delete(":id")
  @RequireRole([Role.ADMIN])
  @ApiOperation({ summary: "Remove user by Id | Require Role: Admin" })
  @ApiParam({ name: "id", type: String, description: "User Id" })
  @ApiOkResponse({ description: "Delete user successfully" })
  @ApiNotFoundResponse({ description: "User is not found | User detail is not found" })
  async remove(@Param("id", new ZodValidationPipe(UUIDParamRequest)) id: string) {
    const dataResponse = await this.accountService.remove(id)
    return responses.response200OK(dataResponse)
  }
}
