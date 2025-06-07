import { ApiProperty } from "@nestjs/swagger"
import { Column, CreateDateColumn, UpdateDateColumn, ValueTransformer } from "typeorm"
import moment from "moment-timezone"

const timeZone = "Asia/Ho_Chi_Minh"

// Transformer để chuyển múi giờ khi trả về API
export class TimezoneTransformer implements ValueTransformer {
  to(value: Date): Date {
    return moment(value).tz(timeZone).toDate() // Lưu đúng múi giờ Việt Nam
  }
  from(value: Date): string {
    return moment.utc(value).tz("Asia/Ho_Chi_Minh").format("YYYY-MM-DD HH:mm:ss")
  }
}

export abstract class BaseEntity {
  @Column({ type: "boolean", default: false, nullable: false })
  @ApiProperty()
  isDeleted: boolean

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", transformer: new TimezoneTransformer() })
  @ApiProperty()
  createdAt: Date

  @UpdateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", transformer: new TimezoneTransformer() })
  @ApiProperty()
  updatedAt: Date
}
