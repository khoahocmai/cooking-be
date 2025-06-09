import { HttpException } from "@nestjs/common"

export interface ApiResponse<T = any> {
  statusCode: number
  message: string
  messageDetail: string
  data: T
}

const Response = <T = any>(statusCode: number, message: string, messageDetail: string, data?: T): ApiResponse<T> => {
  return {
    statusCode,
    message,
    messageDetail,
    data: data ?? null
  }
}

function response200OK(messageDetail?: string, data?: any) {
  const message = "OK"
  const detail = messageDetail?.trim() ? messageDetail : message
  return Response(200, message, detail, data)
} // Dùng cho GET, Trả message hoặc trả về dữ liệu

function response201CreateSuccess(messageDetail?: string, data?: any) {
  const message = "Created successfully"
  const detail = messageDetail?.trim() ? messageDetail : message
  return Response(201, message, detail, data)
} // Dùng cho POST; Trả về dữ liệu đã tạo

function response204SuccessImplement(messageDetail?: string, data?: any) {
  const message = "Successful implementation"
  const detail = messageDetail?.trim() ? messageDetail : message
  return Response(204, message, detail, data)
} // Dùng cho DELETE, PUT; Trả thành công không cần content

function response400BadRequest(messageDetail?: string, data?: any) {
  const message = "Bad request"
  const detail = messageDetail?.trim() ? messageDetail : message
  // consoleLogCustom(message, detail, "error")
  return new HttpException(Response(400, message, detail, data), 400)
} // Dùng cho request không hợp lệ

function response401Unauthorized(messageDetail?: string, data?: any) {
  const message = "Unauthorized"
  const detail = messageDetail?.trim() ? messageDetail : message
  // consoleLogCustom(message, detail, "error")
  return new HttpException(Response(401, message, detail, data), 401)
} // Dùng cho request cần xác thực

function response403Forbidden(messageDetail?: string, data?: any) {
  const message = "Forbidden"
  const detail = messageDetail?.trim() ? messageDetail : message
  // consoleLogCustom(message, detail, "error")
  return new HttpException(Response(403, message, detail, data), 403)
} // Dùng cho request không có quyền

function response404NotFound(messageDetail?: string, data?: any) {
  const message = "Not found"
  const detail = messageDetail?.trim() ? messageDetail : message
  // consoleLogCustom(message, detail, "error")
  return new HttpException(Response(404, message, detail, data), 404)
} // Dùng cho request không tìm thấy

function response409Conflict(messageDetail?: string, data?: any) {
  const message = "Conflict"
  const detail = messageDetail?.trim() ? messageDetail : message
  // consoleLogCustom(message, detail, "error")
  return new HttpException(Response(409, message, detail, data), 409)
} // Dùng cho request trùng lặp

function response423Locked(messageDetail?: string, data?: any) {
  const message = "Locked"
  const detail = messageDetail?.trim() ? messageDetail : message
  // consoleLogCustom(message, detail, "error")
  return new HttpException(Response(423, message, detail, data), 423)
} // Dùng cho request bị khóa

function response500InternalError(messageDetail?: string, data?: any) {
  const message = "Internal server error"
  const detail = messageDetail?.trim() ? messageDetail : message
  // consoleLogCustom(message, detail, "error")
  return new HttpException(Response(500, message, detail, data), 500)
} // Dùng cho lỗi server, dùng chung cho những lỗi không được phân loại

function responseValidationError(details?: string[]) {
  const response = Response(400, "Validation error", "Validation Log")
  return details ? { ...response, details } : response
} // Dùng cho lỗi validation, trả về mảng lỗi chi tiết

export default {
  response200OK,
  response201CreateSuccess,
  response204SuccessImplement,
  response400BadRequest,
  response401Unauthorized,
  response403Forbidden,
  response404NotFound,
  response409Conflict,
  response423Locked,
  response500InternalError,
  responseValidationError
}
