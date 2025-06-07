import { ArgumentMetadata, BadRequestException, PipeTransform } from "@nestjs/common"
import { ZodSchema } from "zod"
import { CustomBadRequestException } from "./custom-validation-badrequest"

export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: any, metadata: ArgumentMetadata) {
    const parsedValue = this.schema.safeParse(value)
    // consoleLogCustom("parsedValue", parsedValue, "info")
    if (parsedValue.success) return parsedValue.data
    // consoleLogCustom("parsedValue.error", parsedValue.error, "error")

    const error = parsedValue.error.errors.map((error) => `Field '${error.path.join(".")}': ${error.message}`)
    throw new CustomBadRequestException(error)
  }
}
