import responses from "@/helpers/responses"
import { Injectable } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import { In, Like, Repository } from "typeorm"
import { UpdateUserInfoRequestType } from "../account/account.validation"
import { CreateUserInfoDto } from "./dto/user-info.dto"
import { UserInfo } from "./entities/user-info.entity"

@Injectable()
export class UserInfoService {
  constructor(@InjectRepository(UserInfo) private readonly userInfoRepository: Repository<UserInfo>) {}
  async create(createUserInfoDto: CreateUserInfoDto): Promise<void> {
    const userInfo = this.userInfoRepository.create({
      accountId: createUserInfoDto.accountId,
      firstName: createUserInfoDto.firstName,
      lastName: createUserInfoDto.lastName,
      phone: createUserInfoDto.phone,
      dob: createUserInfoDto.dob,
      gender: createUserInfoDto.gender,
      address: createUserInfoDto.address,
      avatarUrl: createUserInfoDto.avatarUrl
    })
    await this.userInfoRepository.save(userInfo)
    return
  }

  async update(accountId: string, updateUserInfoDto: UpdateUserInfoRequestType): Promise<string> {
    const userInfo = await this.userInfoRepository.findOne({
      where: { accountId: accountId, isDeleted: false }
    })

    if (!userInfo) {
      throw responses.response404NotFound("User detail is not found")
    }

    // Lọc bỏ các giá trị undefined để tránh ghi đè sai dữ liệu
    const filteredUpdateData = Object.fromEntries(
      Object.entries(updateUserInfoDto).filter(([_, value]) => value !== undefined)
    )

    // Cập nhật từng trường, chỉ khi có giá trị mới
    Object.assign(userInfo, filteredUpdateData)

    await this.userInfoRepository.save(userInfo)

    return "Update user successfully"
  }

  async remove(accountId: string): Promise<void> {
    const userInfo = await this.userInfoRepository.findOne({
      where: { accountId, isDeleted: false }
    })
    if (!userInfo) {
      throw responses.response404NotFound("User detail is not found")
    }
    userInfo.isDeleted = true
    await this.userInfoRepository.save(userInfo)
    return
  }

  async findUserByUserId(accountId: string): Promise<UserInfo> {
    return this.userInfoRepository.findOne({ where: { accountId, isDeleted: false }, relations: ["user"] })
  }

  async findUsersByUserIds(accountIds: string[]) {
    return this.userInfoRepository.find({
      where: { accountId: In(accountIds), isDeleted: false },
      relations: ["account"]
    })
  }

  async findUserByPhone(phone: string): Promise<UserInfo> {
    return this.userInfoRepository.findOne({
      where: { phone: Like(`%${phone}%`), isDeleted: false },
      relations: ["account"]
    })
  }

  async findByPhone(phone: string): Promise<UserInfo | null> {
    return this.userInfoRepository.findOne({
      where: { phone, isDeleted: false }
    })
  }
}
