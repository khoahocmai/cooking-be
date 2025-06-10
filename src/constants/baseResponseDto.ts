import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger"

export class BaseResponseDto {
  @ApiProperty({ description: "Response status", example: 200 })
  statusCode: number
  @ApiProperty({ description: "Response message", example: "OK" })
  message: string
  @ApiPropertyOptional({ description: "Response message detail" })
  messageDetail: string
  @ApiPropertyOptional({ description: "Response data" })
  data: any
}

export class PaginationDto {
  @ApiProperty({ description: "Page size" })
  pageSize: number
  @ApiProperty({ description: "Total item" })
  totalItem: number
  @ApiProperty({ description: "Current page" })
  currentPage: number
  @ApiProperty({ description: "Max page size" })
  maxPageSize: number
  @ApiProperty({ description: "Total page" })
  totalPage: number
}
