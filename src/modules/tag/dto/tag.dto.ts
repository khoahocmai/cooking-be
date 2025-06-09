import { ApiProperty } from "@nestjs/swagger"

class Tag {
  @ApiProperty({
    description: "Id của Tag, định dạng UUID",
    example: "1d1d4130-0fef-49ce-8e8d-734240456750",
    type: String,
    required: true
  })
  id: number
  @ApiProperty({
    description: "Tên của thẻ (ví dụ: 'Healthy', 'Quick', 'Vegetarian', v.v.)",
    example: "Healthy",
    type: String,
    required: true
  })
  name: string
  isDeleted: boolean
  createdAt: Date
  updatedAt: Date
}

export class CreateTagRequestDto {
  @ApiProperty({
    description: "Tên của thẻ (ví dụ: 'Healthy', 'Quick', 'Vegetarian', v.v.)",
    example: "Healthy",
    type: String,
    required: true
  })
  name: string // Tên của thẻ (ví dụ: "Healthy", "Quick", "Vegetarian", v.v.)
}

export class CreateTagService {
  messageDetail: string
  data: CreateTagRequestDto[]
}

export class UpdateTagDto {}
