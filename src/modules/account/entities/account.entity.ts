import { BaseEntity } from "@/constants/baseEntity"
import { UserInfo } from "@/modules/user-info/entities/user-info.entity"
import { ApiProperty } from "@nestjs/swagger"
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity("Account")
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  @ApiProperty()
  id: string

  @Column({ type: "varchar", nullable: true, unique: true })
  @ApiProperty()
  email: string | null

  @Column({ type: "varchar", nullable: true, unique: true })
  @ApiProperty()
  username: string | null

  @Column({ type: "varchar", nullable: true })
  @ApiProperty()
  password: string | null

  @Column({
    default: "USER",
    type: "enum",
    enum: ["USER", "STAFF", "ADMIN"],
    nullable: false
  })
  @ApiProperty()
  role: string

  @Column({
    default: "LOCAL",
    type: "enum",
    enum: ["LOCAL", "GOOGLE"]
  })
  @ApiProperty()
  accountType: string

  @Column({ type: "boolean", default: false, nullable: false })
  @ApiProperty()
  isActive: boolean

  @Column({ type: "varchar", nullable: true })
  @ApiProperty()
  codeId: string

  @Column({ nullable: true })
  @ApiProperty()
  codeExpired: Date

  @Column({ type: "boolean", default: false, nullable: false })
  @ApiProperty()
  isBanned: boolean

  @OneToOne(() => UserInfo, (userInfo) => userInfo.account)
  userInfo: UserInfo
}
