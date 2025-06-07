import { BaseResponseDto } from "@/constants/baseResponseDto"
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class LoginRequestDto {
  @ApiProperty({
    example: "email@example.com/username",
    description: "Email address or username"
  })
  loginKey: string
  @ApiProperty({
    example: "P@s5Word",
    description: "User password",
    minLength: 8,
    maxLength: 100
  })
  password: string
} // Định nghĩa cấu trúc request body cho API login

export class AccountPayload {
  @ApiProperty({ description: "User id" })
  id: string
  @ApiProperty({ description: "User email" })
  email: string
  @ApiPropertyOptional({ description: "User role" })
  role: string
}

export class LoginResponseDto {
  @ApiProperty({
    description: "User information",
    type: AccountPayload
  })
  account: AccountPayload

  @ApiProperty({
    description: "Access token"
  })
  accessToken: string
  @ApiProperty({
    description: "Access token expired time"
  })
  expiresAccess: Date
  @ApiProperty({
    description: "Refresh token"
  })
  refreshToken: string
  @ApiProperty({
    description: "Refresh token expired time"
  })
  expiresRefresh: Date
} // Định nghĩa cấu trúc response trả về cho API login

export class RefreshResponseDto {
  @ApiProperty({
    description: "Access token"
  })
  accessToken: string
  @ApiProperty({
    description: "Access token expired time"
  })
  expiresAccess: Date
  @ApiProperty({
    description: "Refresh token"
  })
  refreshToken: string
} // Định nghĩa cấu trúc response trả về cho API refresh token

export class RegisterDto {
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
  @ApiProperty({
    example: "P@s5Word",
    description:
      "User password. Must be 8-100 characters long, including at least one uppercase letter, one lowercase letter, one number, and one special character",
    minLength: 8,
    maxLength: 100,
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,100}$"
  })
  password: string
  @ApiPropertyOptional({
    example: "ADULT",
    description: "The role of the user. If not provided, the default role is 'ADULT'"
  })
  role: string
} // Định nghĩa cấu trúc request body cho API register

export class ControllerRegisterDto extends BaseResponseDto {
  @ApiProperty({ description: "Response data", type: String })
  data: string
} // Định nghĩa cấu trúc response trả về cho API register

export class RegisterChildDto {
  @ApiProperty({
    example: "username",
    description: "Username. Do not contain special characters",
    pattern: "^[a-zA-Z0-9]+$"
  })
  username: string
  @ApiProperty({
    example: "P@s5Word",
    description:
      "User password. Must be 8-100 characters long, including at least one uppercase letter, one lowercase letter, one number, and one special character",
    minLength: 8,
    maxLength: 100,
    pattern: "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,100}$"
  })
  password: string
  @ApiPropertyOptional({
    example: "Minh Khang",
    description: "The first name of the user"
  })
  firstName: string
  @ApiPropertyOptional({
    example: "Lê",
    description: "The last name of the user"
  })
  lastName: string
  @ApiPropertyOptional({
    example: "MALE",
    description: "The gender of the user"
  })
  gender: string
  @ApiPropertyOptional({
    example: "2021-08-17",
    description: "The date of birth of the user"
  })
  dob: string
} // Định nghĩa cấu trúc request body cho API register

export class ActiveAccountDto {
  @ApiProperty({
    example: "abcdef-123456-lmnopq",
    description: "The id of the user"
  })
  id: string

  @ApiProperty({
    example: "123456",
    description: "The code sent to the user's email"
  })
  code: string
} // Định nghĩa cấu trúc request body cho API active account

export class ReactiveAccountDto {
  @ApiProperty({
    example: "email@example.com",
    description: "User email for get code"
  })
  email: string
} // Định nghĩa cấu trúc request body cho API retry-active account

export class RequestForgotPasswordDto extends ReactiveAccountDto {} // Định nghĩa cấu trúc request body cho API request-change-password - kế thừa từ ReactiveAccountDto

export class ResetForgotPasswordDto {
  @ApiProperty({
    example: "123456",
    description: "The otp sent to the user's email"
  })
  code: string

  @ApiProperty({
    example: "P@s5Word",
    description:
      "User password. Must be 8-100 characters long, including at least one uppercase letter, one lowercase letter, one number, and one special character"
  })
  password: string

  @ApiProperty({
    example: "P@s5Word",
    description: "Confirm password"
  })
  confirmPassword: string

  @ApiProperty({
    example: "email@example.com",
    description: "User email - do not alow input"
  })
  email: string
} // Định nghĩa cấu trúc request body cho API changePassword

export class ChangePasswordDto {
  @ApiProperty({ description: "Old password" })
  oldPassword: string
  @ApiProperty({ example: "P@s5Word", description: "New password" })
  newPassword: string
  @ApiProperty({ example: "P@s5Word", description: "Confirm new password" })
  confirmPassword: string
}

export class ChangeRefreshTokenDto {
  @ApiProperty({
    example: "abcdef-123456-lmnopq",
    description: "The refresh token"
  })
  refreshToken: string
} // Định nghĩa cấu trúc request body cho API change-refresh-token

export class ControllerLoginResponseDto extends BaseResponseDto {
  @ApiProperty({ description: "Response data", type: LoginResponseDto })
  data: LoginResponseDto
}
export class ControllerLoginMobileResponseDto extends BaseResponseDto {
  @ApiProperty({ description: "Response data", type: LoginResponseDto })
  data: LoginResponseDto
}

export class ControllerActiveResponseDto extends BaseResponseDto {
  @ApiProperty({ description: "Response data", type: LoginResponseDto })
  data: LoginResponseDto
}

export class ControllerRefreshResponseDto extends BaseResponseDto {
  @ApiProperty({ description: "Response data", type: RefreshResponseDto })
  data: RefreshResponseDto
}

export class ControllerRefreshMobileResponseDto extends BaseResponseDto {
  @ApiProperty({ description: "Response data", type: RefreshResponseDto })
  data: RefreshResponseDto
}
export class ControllerCheckRefreshMobileDto extends BaseResponseDto {
  @ApiProperty({ description: "Response data", type: String })
  data: string
}
