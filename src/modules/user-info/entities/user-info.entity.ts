import { BaseEntity } from "@/constants/baseEntity"
import { Account } from "@/modules/account/entities/account.entity"
import { ApiProperty } from "@nestjs/swagger"
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm"

@Entity("UserInfo") // Tên bảng trong cơ sở dữ liệu
export class UserInfo extends BaseEntity {
  @PrimaryColumn("uuid")
  @ApiProperty()
  accountId: string

  @Column({ type: "varchar", nullable: false })
  @ApiProperty()
  firstName: string

  @Column({ type: "varchar", nullable: false })
  @ApiProperty()
  lastName: string

  @Column({ type: "varchar", nullable: true, unique: true })
  @ApiProperty()
  phone: string | null

  @Column({ type: "date", nullable: true })
  @ApiProperty()
  dob: Date | null

  @Column({ type: "varchar", nullable: true })
  @ApiProperty()
  address: string | null

  @Column({
    default: "OTHER",
    type: "enum",
    enum: ["MALE", "FEMALE", "OTHER"],
    nullable: false
  })
  @ApiProperty()
  gender: string

  @Column({ type: "varchar", nullable: true })
  @ApiProperty()
  avatarUrl: string

  // Quan hệ với bảng User
  @OneToOne(() => Account, (account) => account.userInfo, { onDelete: "CASCADE" })
  @JoinColumn()
  account: Account
}
