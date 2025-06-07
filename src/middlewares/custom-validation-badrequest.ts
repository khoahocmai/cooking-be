import { BadRequestException } from "@nestjs/common"

export class CustomBadRequestException extends BadRequestException {
  constructor(details?: string[]) {
    super({
      statusCode: 400,
      info: "Validation Log",
      message: "Validation error",
      details // Các chi tiết bổ sung
    })
  }
}
