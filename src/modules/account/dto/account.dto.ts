import { BaseResponseDto } from "@/constants/baseResponseDto"
import { Pagination } from "@/constants/types"
import { ApiProperty, ApiPropertyOptional, OmitType } from "@nestjs/swagger"

class UserInfo {
  @ApiProperty({ description: "User's first name" })
  firstName: string
  @ApiProperty({ description: "User's last name" })
  lastName: string
  @ApiProperty({ description: "User's phone number" })
  phone: string
  @ApiProperty({ description: "User's date of birth", type: String, format: "date-time" })
  dob: Date
  @ApiProperty({ description: "User's address" })
  address: string
  @ApiProperty({ description: "User's gender" })
  gender: string
  @ApiProperty({ description: "URL to user's avatar" })
  avatarUrl: string
}

class GetAllUser {
  @ApiProperty({ description: "User ID" })
  id: String
  @ApiProperty({ description: "User email" })
  email: String
  @ApiProperty({ description: "User username" })
  username: String
  @ApiProperty({ description: "User role" })
  role: String
  @ApiProperty({ description: "User account type" })
  accountType: String
  @ApiProperty({ description: "User is active" })
  isActive: Boolean
  @ApiProperty({ description: "User is banned" })
  isBanned: Boolean
  @ApiProperty({ description: "Detailed information about the user", type: UserInfo, nullable: true })
  userInfo: UserInfo | null
  @ApiProperty({ description: "Formatted creation date" })
  createAtFormatted: string
  @ApiProperty({ description: "Formatted update date" })
  updateAtFormatted: string
}

export class CreateUserDto {
  @ApiProperty({
    example: "email@example.com",
    description:
      "User password. Must be 8-100 characters long, including at least one uppercase letter, one lowercase letter, one number, and one special character",
    minLength: 8,
    maxLength: 100,
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,100}$"
  })
  email: string
  @ApiProperty({
    example: "username",
    description: "Username. Do not contain special characters",
    pattern: "^[a-zA-Z0-9]+$"
  })
  username: string
  @ApiPropertyOptional({
    example: "ADULT",
    description: "The role of the user. If not provided, the default role is 'ADULT'"
  })
  role: string
}

export class UpdateUserDetailDto {
  @ApiPropertyOptional({ description: "User phone number" })
  phone: string
  @ApiPropertyOptional({ description: "User first name" })
  firstName: string
  @ApiPropertyOptional({ description: "User last name" })
  lastName: string
  @ApiPropertyOptional({ description: "User date of birth" })
  dob: Date
  @ApiPropertyOptional({ description: "User address" })
  address: string
  @ApiPropertyOptional({ description: "User gender" })
  gender: string
  @ApiPropertyOptional({ description: "User avatar Url" })
  avatarUrl: string
}

export class UpdateUserDetailChildDto extends OmitType(UpdateUserDetailDto, ["phone", "address"] as const) {}

export class GetUsersResponseDto {
  @ApiProperty({ description: "List user information", type: [GetAllUser] })
  response: GetAllUser[]

  @ApiProperty({ description: "Pagination information" })
  pagination: Pagination
}

export class LickAccountDto {
  @ApiProperty({ description: "Adult email" })
  email: string
}

export class Profile {
  @ApiProperty({ description: "User ID" })
  id: String
  @ApiProperty({ description: "User email" })
  email: String
  @ApiProperty({ description: "User username" })
  username: String
  @ApiProperty({ description: "User role" })
  role: String
  @ApiProperty({ description: "User phone" })
  phone: String
  @ApiProperty({ description: "User first name" })
  firstName: String
  @ApiProperty({ description: "User last name" })
  lastName: String
  @ApiProperty({ description: "User date of birth" })
  dob: String
  @ApiProperty({ description: "User address" })
  address: String | null
  @ApiProperty({ description: "User gender" })
  gender: String
  @ApiProperty({ description: "User avatar Url" })
  avatarUrl: String | null
}

export class GetUserByIdResponse {
  @ApiProperty({ description: "User ID" })
  id: String
  @ApiProperty({ description: "User email" })
  email: String
  @ApiProperty({ description: "User username" })
  username: String
  @ApiProperty({ description: "User role" })
  role: String
  @ApiProperty({ description: "User Id parent account" })
  parentId: String
  @ApiProperty({ description: "User active" })
  isActive: Boolean
  @ApiProperty({ description: "User account type" })
  accountType: String
  @ApiProperty({ description: "Detailed information about the user", type: UserInfo, nullable: true })
  useInfo: UserInfo
}

export class ControllerGetUserByIdResponse extends BaseResponseDto {
  @ApiProperty({ description: "User information", type: GetUserByIdResponse })
  data: GetUserByIdResponse
}

export class ControllerGetAllUserResponse extends BaseResponseDto {
  @ApiProperty({ description: "User information", type: [GetAllUser] })
  data: GetAllUser[]
}

export class ControllerGetProfileResponse extends BaseResponseDto {
  @ApiProperty({ description: "User information", type: Profile })
  data: Profile
}
