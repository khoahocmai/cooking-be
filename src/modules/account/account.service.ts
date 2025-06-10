import { ChangePasswordRequestType } from "@/auth/auth.validation"
import { ActiveAccountDto, RegisterDto, ResetForgotPasswordDto } from "@/auth/dto/auth.dto"
import { Gender, Role, AccountPayload } from "@/constants/types"
import responses from "@/helpers/responses"
import {
  calculatePagination,
  comparePasswordHelper,
  convertManualToDisplay,
  formatDob,
  getTime,
  hashPasswordHelper,
  isBefore
} from "@/helpers/utils"
import { MailerService } from "@nestjs-modules/mailer"
import { forwardRef, Inject, Injectable } from "@nestjs/common"
import { ConfigService } from "@nestjs/config"
import { InjectRepository } from "@nestjs/typeorm"
import { FindOptionsWhere, In, Like, Not, Repository } from "typeorm"
import { CreateUserRequestType, UpdateUserInfoRequestType } from "./account.validation"

import { CreateUserInfoDto } from "../user-info/dto/user-info.dto"
import { UserInfo } from "../user-info/entities/user-info.entity"
import { UserInfoService } from "../user-info/user-info.service"
import { GetUsersResponseDto, Profile } from "./dto/account.dto"
import { Account } from "./entities/account.entity"

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account) private readonly accountRepository: Repository<Account>,

    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => UserInfoService)) private readonly userInfoService: UserInfoService
  ) {}
  async create(dataRequest: CreateUserRequestType): Promise<string> {
    // Create a query runner
    const queryRunner = this.accountRepository.manager.connection.createQueryRunner()

    // Start transaction
    await queryRunner.connect()
    await queryRunner.startTransaction()
    // check if email or username already exist
    await this.validateUniqueFields(dataRequest.email, dataRequest.username)

    try {
      const password = this.generateRandomPassword(12)
      const hashPassword = await hashPasswordHelper(password)
      const newAccount = this.accountRepository.create({
        email: dataRequest.email,
        username: dataRequest.username,
        password: hashPassword,
        accountType: "LOCAL",
        role: dataRequest.role || "USER",
        isActive: true,
        codeId: null,
        codeExpired: null,
        isDeleted: false
      })

      // Save user within transaction
      await queryRunner.manager.save(newAccount)

      const userInfo = new UserInfo()
      userInfo.accountId = newAccount.id
      userInfo.firstName = ""
      userInfo.lastName = ""
      userInfo.phone = null
      userInfo.dob = null
      userInfo.address = null
      userInfo.gender = "OTHER"
      userInfo.avatarUrl = null

      // Save user detail within transaction
      await queryRunner.manager.save(userInfo)

      // If we get here, commit the transaction
      await queryRunner.commitTransaction()

      // Send welcome email to newly created account
      if (dataRequest.email) {
        this.mailerService.sendMail({
          to: dataRequest.email,
          subject: "Welcome to Cooking DK",
          template: "welcome",
          context: {
            username: dataRequest.username,
            email: dataRequest.email,
            password: password
          }
        })
      }

      return "Create user successfully"
    } catch (error) {
      // If anything fails, roll back changes
      await queryRunner.rollbackTransaction()
      throw responses.response400BadRequest("Invalid data fields")
    } finally {
      // Release the query runner regardless of outcome
      await queryRunner.release()
    }
  } // Tạo user

  async findAll(
    user: AccountPayload,
    pageIndex: number,
    pageSize: number,
    keyword: string,
    isDel: string
  ): Promise<GetUsersResponseDto> {
    const whereCondition: Record<string, any> = {
      isDeleted: false
    }
    switch (user.role) {
      case "ADMIN":
        whereCondition["role"] = Not("ADMIN")
        break
      case "STAFF":
        whereCondition["role"] = Not(In(["STAFF", "ADMIN"]))
        break
      default:
        throw responses.response403Forbidden("Unauthorized role")
    }

    // Nếu có giá trị cho isDel, thêm vào điều kiện
    if (isDel !== undefined && isDel !== "") {
      if (isDel === "t" || isDel === "f") {
        whereCondition["isDeleted"] = isDel
      } else {
        throw responses.response400BadRequest("isDel must be 't' or 'f'")
      }
    }

    if (keyword !== undefined) {
      whereCondition["email"] = Like(`%${keyword}%`)
    }

    const [accounts, count] = await this.accountRepository.findAndCount({
      where: whereCondition,
      relations: ["userInfo"],
      take: pageSize,
      skip: (pageIndex - 1) * pageSize
    })
    const response = accounts.map((account) => ({
      id: account.id,
      email: account.email,
      username: account.username,
      role: account.role,
      accountType: account.accountType,
      isActive: account.isActive,
      isBanned: account.isBanned,
      userInfo: account.userInfo
        ? {
            firstName: account.userInfo.firstName,
            lastName: account.userInfo.lastName,
            phone: account.userInfo.phone,
            dob: account.userInfo.dob,
            address: account.userInfo.address,
            gender: account.userInfo.gender,
            avatarUrl: account.userInfo.avatarUrl
          }
        : null,
      createAtFormatted: convertManualToDisplay(account.createdAt),
      updateAtFormatted: convertManualToDisplay(account.updatedAt)
    }))
    const pagination = calculatePagination(count, pageSize, pageIndex)

    return { response, pagination }
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.accountRepository
      .createQueryBuilder("account")
      .leftJoinAndSelect("account.userInfo", "userInfo")
      .select([
        "account.id",
        "account.email",
        "account.username",
        "account.role",
        "account.isActive",
        "account.accountType",
        "account.isDeleted",
        "account.createdAt",
        "account.updatedAt",
        "accountDetail.phone",
        "accountDetail.firstName",
        "accountDetail.lastName",
        "accountDetail.dob",
        "accountDetail.address",
        "accountDetail.gender",
        "accountDetail.avatarUrl"
      ])
      .where("account.id = :id", { id })
      .getOne()

    if (!account) {
      throw responses.response404NotFound("Account is not found or has been deleted")
    }

    return account
  }

  async update(id: string, updateUserDetailDto: UpdateUserInfoRequestType): Promise<string> {
    return await this.userInfoService.update(id, updateUserDetailDto)
  }

  async updateProfile(account: AccountPayload, updateUserDetailDto: UpdateUserInfoRequestType): Promise<string> {
    return await this.userInfoService.update(account.id, updateUserDetailDto)
  }

  async remove(accountId: string): Promise<string> {
    const account = await this.accountRepository.findOne({
      where: { id: accountId }
    })
    if (!account) {
      throw responses.response404NotFound("Account is not found")
    }

    account.isDeleted = true
    await this.userInfoService.remove(accountId)
    await this.accountRepository.save(account)

    return "Delete user successfully"
  }

  async findUserByEmail(email: string): Promise<Account> {
    return this.accountRepository.findOne({
      where: { email }
    })
  } // Tìm user theo email

  async isEmailExist(email: string): Promise<Boolean> {
    const user = await this.accountRepository.findOne({
      where: { email }
    })
    if (user) return true
    return false
  } // Kiểm tra email đã tồn tại chưa

  async validateUniqueFields(email: string, username: string) {
    if (email) {
      const existingUser = await this.findUserByEmail(email)
      if (existingUser) {
        throw responses.response409Conflict("Email is already in use", email)
      }
    }

    const existingUsername = await this.accountRepository.findOneBy({ username })
    if (existingUsername) {
      throw responses.response409Conflict("Username is already in use", username)
    }
  } // Kiểm tra email và username đã tồn tại chưa

  async findUserByCondition(condition: FindOptionsWhere<Account>): Promise<Account> {
    return this.accountRepository.findOneBy(condition)
  } // Tìm user theo điều kiện

  async register(registerDto: RegisterDto): Promise<Account> {
    // Create a query runner
    const queryRunner = this.accountRepository.manager.connection.createQueryRunner()

    // Start transaction
    await queryRunner.connect()
    await queryRunner.startTransaction()
    // check if email or username already exist
    await this.validateUniqueFields(registerDto.email, registerDto.username)
    try {
      const userRole = registerDto.role.toUpperCase()
      if (Role[userRole] === undefined) throw responses.response400BadRequest("Role is not valid")

      if (registerDto.password !== registerDto.confirmPassword) {
        throw responses.response400BadRequest("Password and confirm password do not match", {
          password: registerDto.password,
          confirmPassword: registerDto.confirmPassword
        })
      }

      // hash password
      const hashPassword = await hashPasswordHelper(registerDto.password)
      const codeId = this.generateSixDigitCode()
      const user = this.accountRepository.create({
        email: registerDto.email,
        username: registerDto.username,
        password: hashPassword,
        role: userRole,
        accountType: "LOCAL",
        isActive: false,
        codeId: codeId,
        codeExpired: getTime(5, "minutes"),
        isDeleted: false
      })
      // Save user within transaction
      await queryRunner.manager.save(user)

      const userInfo = new UserInfo()
      userInfo.accountId = user.id
      userInfo.firstName = ""
      userInfo.lastName = ""
      userInfo.phone = null
      userInfo.dob = null
      userInfo.address = null
      userInfo.gender = "OTHER"
      userInfo.avatarUrl = null

      // Save user detail within transaction
      await queryRunner.manager.save(userInfo)

      // If we get here, commit the transaction
      await queryRunner.commitTransaction()

      // Send email
      this.mailerService.sendMail({
        to: user.email, // list of receivers
        subject: "Register your account at Cooking DK",
        template: "register",
        context: {
          name: user.email,
          activationCode: codeId,
          userId: user.id,
          time: user.codeExpired
        }
      })

      return user
    } catch (error) {
      // If anything fails, roll back changes
      await queryRunner.rollbackTransaction()
      throw responses.response400BadRequest("Invalid data fields")
    } finally {
      // Release the query runner regardless of outcome
      await queryRunner.release()
    }
  } // Đăng ký tài khoản

  async handleActive(data: ActiveAccountDto): Promise<Account> {
    const condition = { email: data.email, codeId: data.code }
    const user = await this.findUserByCondition(condition)
    if (!user) {
      throw responses.response400BadRequest("OTP is expired or not correct")
    }
    // Check expire code
    const isBeforeCheck = isBefore(user.codeExpired)
    if (isBeforeCheck) {
      // Valid => update user
      await this.accountRepository.update({ email: data.email }, { codeId: null, codeExpired: null, isActive: true })
      return user
    } else {
      throw responses.response400BadRequest("OTP is expired or not correct")
    }
  } // Kích hoạt tài khoản

  async requestActive(email: string): Promise<string> {
    // Check email
    const user = await this.findUserByEmail(email)
    if (!user) {
      throw responses.response400BadRequest("Account not found")
    }
    if (user.isActive) {
      throw responses.response400BadRequest("Account is already activated")
    }

    const codeId = this.generateSixDigitCode()
    // Update codeId and codeExpired
    await this.accountRepository.update(user.id, {
      codeId: codeId,
      codeExpired: getTime(5, "minutes")
    })

    // Send email
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: "Activate your account at Cooking DK",
      template: "register",
      context: {
        name: user.email,
        activationCode: codeId,
        userId: user.id,
        time: user.codeExpired
      }
    })

    return "Please check your email to get the activation code"
  } // Gửi lại mã code kích hoạt

  async retryActive(userId: string): Promise<string> {
    const user = await this.accountRepository.findOne({
      where: {
        id: userId,
        isDeleted: false
      }
    })
    if (!user) {
      throw responses.response400BadRequest("Account not found or has been deleted")
    }
    if (user.isActive) {
      throw responses.response409Conflict("Account is already activated")
    }

    const codeId = this.generateSixDigitCode()
    // Update codeId and codeExpired

    user.codeId = codeId
    user.codeExpired = getTime(5, "minutes")
    await this.accountRepository.save(user)

    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: "Kích hoạt tài khoản của bạn tại @koine", // Subject line
      template: "register",
      context: {
        name: user.email,
        activationCode: codeId,
        userId: user.id,
        time: user.codeExpired
      }
    })

    return "Please check your email to get the activation code"
  }

  async requestForgotPassword(email: string): Promise<string> {
    // Check email
    const user = await this.findUserByEmail(email)
    if (!user) {
      throw responses.response400BadRequest("Account not found")
    }

    const codeId = this.generateSixDigitCode()
    // Update codeId and codeExpired
    await this.accountRepository.update(user.id, {
      codeId: codeId,
      codeExpired: getTime(5, "minutes")
    })

    // Send email
    this.mailerService.sendMail({
      to: user.email, // list of receivers
      subject: "Change password at Cooking DK", // Subject line
      template: "password",
      context: {
        name: user.email,
        activationCode: codeId
      }
    })

    return "Please check your email to get the activation code"
  } // Gửi lại mã code kích hoạt

  async resetForgotPassword(data: ResetForgotPasswordDto): Promise<string> {
    // Change password
    if (data.password !== data.confirmPassword) {
      throw responses.response400BadRequest("Password and confirm password do not match", {
        passport: data.password,
        confirmPassword: data.confirmPassword
      })
    }
    // Check email
    const user = await this.findUserByEmail(data.email)
    if (!user) {
      throw responses.response404NotFound("Account is not found", data.email)
    }

    // Check expire code
    const isBeforeCheck = isBefore(user.codeExpired)
    if (isBeforeCheck) {
      // Valide => update password
      const hashPassword = await hashPasswordHelper(data.password)
      await this.accountRepository.update(user.id, { codeId: null, codeExpired: null, password: hashPassword })
      return "Password changed successfully"
    } else {
      throw responses.response400BadRequest("The code is expired")
    }
  } // Thay đổi mật khẩu

  async changePassword(user: AccountPayload, data: ChangePasswordRequestType): Promise<string> {
    // Check old password
    const userCheck = await this.accountRepository.findOne({
      where: { id: user.id, isDeleted: false }
    })
    if (!userCheck) {
      throw responses.response404NotFound("Account is not found")
    }
    if (userCheck.isActive === false) {
      throw responses.response400BadRequest("Account is not active")
    }
    const isMatch = await comparePasswordHelper(data.oldPassword, userCheck.password)
    if (!isMatch) throw responses.response400BadRequest("Old password is incorrect")

    if (data.newPassword !== data.confirmPassword) {
      throw responses.response400BadRequest("Password and confirm password do not match")
    }
    // Change password
    const hashPassword = await hashPasswordHelper(data.newPassword)
    await this.accountRepository.update(user.id, { password: hashPassword })
    return "Change password successfully"
  } // Thay đổi mật khẩu

  async getProfile(userId: string): Promise<Profile> {
    const account = await this.accountRepository.findOne({
      where: { id: userId },
      relations: ["userInfo"]
    })

    if (!account) {
      throw responses.response404NotFound("User information is not found")
    }

    return {
      id: account.id,
      email: account.email || null,
      username: account.username,
      role: account.role,
      phone: account.userInfo?.phone || null,
      firstName: account.userInfo?.firstName || null,
      lastName: account.userInfo?.lastName || null,
      dob: account.userInfo?.dob ? formatDob(account.userInfo?.dob.toString()) : null,
      address: account.userInfo?.address || null,
      gender: account.userInfo?.gender,
      avatarUrl: account.userInfo?.avatarUrl || null
    }
  } // Lấy thông tin user

  async createUserGGLogin(email: string, firstName: string, lastName: string, avatarUrl: string): Promise<Account> {
    const username = email?.split("@")[0] ?? `user_${Date.now()}`

    const user = this.accountRepository.create({
      email: email,
      username: username,
      password: null,
      role: "USER",
      accountType: "GOOGLE",
      isActive: true,
      codeId: null,
      codeExpired: null,
      isDeleted: false
    })
    await this.accountRepository.save(user)

    const userInfo: CreateUserInfoDto = {
      accountId: user.id,
      firstName: firstName,
      lastName: lastName,
      phone: null,
      dob: null,
      address: null,
      gender: "OTHER",
      avatarUrl: avatarUrl
    }
    await this.userInfoService.create(userInfo)

    return user
  }

  async getUserByRole(role: "USER" | "STAFF" | "ADMIN"): Promise<Account[]> {
    const userRole = role.toUpperCase()
    if (Role[userRole] === undefined) throw responses.response400BadRequest("Role is not valid")
    return await this.accountRepository
      .createQueryBuilder("user")
      .select([
        "user.id",
        "user.email",
        "user.username",
        "user.role",
        "user.isActive",
        "user.accountType",
        "userDetail.phone",
        "userDetail.firstName",
        "userDetail.lastName",
        "userDetail.dob",
        "userDetail.address",
        "userDetail.avatarUrl",
        "userDetail.gender"
      ])
      .leftJoin("user.userDetail", "userDetail")
      .where("user.role = :userRole", { userRole })
      .andWhere("user.isDeleted = :isDeleted", { isDeleted: false })
      .getMany()
  }

  private generateSixDigitCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  private generateRandomPassword(length = 12): string {
    const lowercase = "abcdefghijklmnopqrstuvwxyz"
    const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    const numbers = "0123456789"
    const special = "@$!%*?&"
    const allChars = lowercase + uppercase + numbers + special

    if (length < 8 || length > 100) {
      throw responses.response400BadRequest("Password length must be between 8 and 100 characters")
    }

    // Đảm bảo mỗi loại ký tự đều có ít nhất một
    const getRandom = (chars: string) => chars[Math.floor(Math.random() * chars.length)]

    const mandatory = [getRandom(lowercase), getRandom(uppercase), getRandom(numbers), getRandom(special)]

    const remainingLength = length - mandatory.length
    const remainingChars = Array.from({ length: remainingLength }, () => getRandom(allChars))

    const passwordArray = [...mandatory, ...remainingChars]

    // Xáo trộn để vị trí không bị đoán
    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]]
    }

    return passwordArray.join("")
  }

  async findAllActiveUsersWithDetails(): Promise<Account[]> {
    return this.accountRepository.find({
      where: {
        isDeleted: false,
        isActive: true
      },
      relations: ["userDetail"]
    })
  }

  async findUsersByIdsWithRole(userIds: string[], role: string): Promise<Account[]> {
    if (!userIds.length) return []

    return this.accountRepository.find({
      where: {
        id: In(userIds),
        role: role,
        isDeleted: false
      },
      relations: ["userDetail"]
    })
  }

  async findUsersByIds(userIds: string[]): Promise<Account[]> {
    if (!userIds.length) return []

    return this.accountRepository.find({
      where: {
        id: In(userIds),
        isDeleted: false
      },
      relations: ["userDetail"]
    })
  }

  async countUsersByIds(userIds: string[]): Promise<number> {
    if (!userIds.length) return 0

    return this.accountRepository.count({
      where: {
        id: In(userIds),
        isDeleted: false
      }
    })
  }

  async handleBan(userId: string): Promise<string> {
    const user = await this.accountRepository.findOneBy({ id: userId, isDeleted: false })
    if (!user) {
      throw responses.response404NotFound("Người dùng không tồn tại")
    }

    user.isBanned = !user.isBanned
    await this.accountRepository.save(user)

    return "Hoàn thành thao tác"
  }
}
