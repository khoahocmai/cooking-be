import { BaseEntity } from "@/constants/baseEntity"
import { Recipe } from "@/modules/recipe/entities/recipe.entity"
import { UserInfo } from "@/modules/user-info/entities/user-info.entity"
import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm"

@Entity("Account")
export class Account extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Column({ type: "varchar", nullable: true, unique: true })
  email: string | null

  @Column({ type: "varchar", nullable: true, unique: true })
  username: string | null

  @Column({ type: "varchar", nullable: true })
  password: string | null

  @Column({
    default: "USER",
    type: "enum",
    enum: ["USER", "STAFF", "ADMIN"],
    nullable: false
  })
  role: string

  @Column({
    default: "LOCAL",
    type: "enum",
    enum: ["LOCAL", "GOOGLE"]
  })
  accountType: string

  @Column({ type: "boolean", default: false, nullable: false })
  isActive: boolean

  @Column({ type: "varchar", nullable: true })
  codeId: string

  @Column({ nullable: true })
  codeExpired: Date

  @Column({ type: "boolean", default: false, nullable: false })
  isBanned: boolean

  @OneToOne(() => UserInfo, (userInfo) => userInfo.account)
  userInfo: UserInfo

  @OneToMany(() => Recipe, (recipe) => recipe.creator)
  recipes: Recipe[]
}
