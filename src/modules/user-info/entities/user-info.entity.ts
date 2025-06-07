import { BaseEntity } from "@/constants/baseEntity"
import { Account } from "@/modules/account/entities/account.entity"
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from "typeorm"

@Entity("UserInfo") // Tên bảng trong cơ sở dữ liệu
export class UserInfo extends BaseEntity {
  @PrimaryColumn("uuid")
  accountId: string

  @Column({ type: "varchar", nullable: false })
  firstName: string

  @Column({ type: "varchar", nullable: false })
  lastName: string

  @Column({ type: "varchar", nullable: true, unique: true })
  phone: string | null

  @Column({ type: "date", nullable: true })
  dob: Date | null

  @Column({ type: "varchar", nullable: true })
  address: string | null

  @Column({
    default: "OTHER",
    type: "enum",
    enum: ["MALE", "FEMALE", "OTHER"],
    nullable: false
  })
  gender: string

  @Column({ type: "varchar", nullable: true })
  avatarUrl: string

  // Quan hệ với bảng User
  @OneToOne(() => Account, (account) => account.userInfo, { onDelete: "CASCADE" })
  @JoinColumn()
  account: Account
}
