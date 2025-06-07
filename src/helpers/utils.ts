import { Pagination } from "@/constants/types"
import { Logger } from "@nestjs/common"
import * as bcrypt from "bcrypt"
import { format, toZonedTime } from "date-fns-tz"
import dayjs from "dayjs"
import { Request } from "express"
import responses from "./responses"

const saltRounds = 10

export const hashPasswordHelper = async (plainPassword: string) => {
  try {
    return await bcrypt.hash(plainPassword, saltRounds)
  } catch (error) {
    consoleLogCustom("Error hashing password", error, "error")
  }
} // Hash password

export const comparePasswordHelper = async (plainPassword: string, hashPassword: string) => {
  try {
    return await bcrypt.compare(plainPassword, hashPassword)
  } catch (error) {
    consoleLogCustom("Error hashing password", error, "error")
  }
} // So sánh password

export function calculatePagination(
  count: number,
  pageSize: number,
  pageIndex: number,
  maxPageSizeLimit: number = 100 // Số lượng item tối đa trên mỗi trang, mặc định không nhập là 100
): Pagination {
  if (pageSize > maxPageSizeLimit) pageSize = maxPageSizeLimit

  // Tính toán thông tin phân trang
  const totalPage = Math.ceil(count / pageSize)
  const pagination = {
    pageSize, // Số lượng item trên mỗi trang
    totalItem: count, // Tổng số item
    currentPage: pageIndex, // Trang hiện tại
    maxPageSize: maxPageSizeLimit, // Số lượng item tối đa trên mỗi trang
    totalPage // Tổng số trang
  }

  return pagination
} // Tính toán thông tin phân trang

export const isNumber = (v: any): boolean => {
  if (typeof v === "number") {
    return true // v là một số
  } // Kiểm tra nếu v là số hoặc chuỗi đại diện cho số

  if (typeof v === "string") {
    const num = +v
    return Number.isFinite(num) && v.trim() !== ""
  } // Chuyển đổi chuỗi thành số và kiểm tra tính hợp lệ

  return false // v không phải là số hoặc chuỗi hợp lệ
} // Kiểm tra xem một giá trị có phải là số hay không

export function isValidUUID(uuid: any): boolean {
  if (uuid === undefined || uuid === null || uuid === "") {
    return false // Return false if input not provided
  } // Check if input is undefined, null, or an empty string

  if (typeof uuid !== "string") {
    return false // Return false if input is not a string
  } // Check if input is not a string

  // Regular expression to check for valid UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  // Test the input against the UUID regex pattern
  return uuidRegex.test(uuid) // Return true if the input is a valid UUID
} // Kiểm tra xem một giá trị có phải là UUID hay không

export function logNonCustomError(error: any): void {
  if (!(error && typeof error === "object" && "statusCode" in error && "info" in error && "message" in error)) {
    Logger.error(error, "Non-custom error")
  }
} // Log non-custom errors

export function removeVietnameseTones(str: string): string {
  // Chuyển toàn bộ chuỗi thành chữ thường
  str = str.toLowerCase()

  // Loại bỏ dấu tiếng Việt
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "")

  // Chuyển đ -> d và Đ -> D (đã chuyển về chữ thường nên không cần dòng này)
  str = str.replace(/đ/g, "d")

  return str
} // Loại bỏ dấu tiếng Việt

export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w\-]+/g, "") // Remove all non-word characters
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
} // Tạo slug từ title

export function getTime(
  amount?: number,
  unit?: "seconds" | "minutes" | "hours" | "days" | "weeks" | "months" | "years"
): Date {
  // let time = dayjs().add(7, "hours") // UTC+7
  let time = dayjs() // UTC
  if (amount && unit) {
    time = time.add(amount, unit)
  }

  return time.toDate()
} // Lấy thời gian hiện tại hoặc thời gian sau một khoảng thời gian

export function isBefore(date: Date | string | dayjs.Dayjs): boolean {
  return dayjs().isBefore(date)
} //  Kiểm tra xem một thời gian có trước thời gian hiện tại hay không

export function isAfter(date: Date | string | dayjs.Dayjs): boolean {
  return dayjs().isAfter(date)
} //  Kiểm tra xem một thời gian có sau thời gian hiện tại hay không

export function extractTokenFromHeader(request: Request): string {
  const authHeader = request.headers["authorization"]
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw responses.response401Unauthorized("Token not found or invalid")
  }
  return authHeader.split(" ")[1] // Lấy phần token sau "Bearer "
} // Lấy token từ header của request

const timeZone = "UTC"
const formatString = "HH:mm:ss-dd/MM/yyyy"
const dobFormatString = "dd/MM/yyyy"

// Function to format dates
export function formatDate(dateInput?: string | Date): string {
  if (!dateInput) return ""

  let date: Date
  if (dateInput instanceof Date) {
    date = dateInput
  } else {
    date = new Date(dateInput)
  }

  if (isNaN(date.getTime())) {
    return "Invalid Date"
  }

  const vietnamTime = toZonedTime(date, "Asia/Ho_Chi_Minh")
  return format(vietnamTime, formatString, { timeZone: "Asia/Ho_Chi_Minh" })
} // Format date HH:mm:ss-dd/MM/yyyy

export function formatDateTime(dateString?: string): string {
  if (!dateString) return ""

  const date = new Date(dateString)
  const zonedDate = toZonedTime(date, "Asia/Ho_Chi_Minh")
  return format(zonedDate, dobFormatString, { timeZone: "Asia/Ho_Chi_Minh" })
} // Format date dd/MM/yyyy

// Function to format Date of Birth (dob)
export function formatDob(dobString?: string): string {
  if (!dobString) return ""

  const date = new Date(dobString)
  const zonedDate = toZonedTime(date, "Asia/Ho_Chi_Minh")
  return format(zonedDate, dobFormatString, { timeZone: "Asia/Ho_Chi_Minh" })
} // Format date dd/MM/yyyy

export function convertManualToDisplay(dateObj: Date): string {
  try {
    // Kiểm tra nếu dateObj không phải là một Date hợp lệ
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      throw new Error("Invalid date object")
    }

    // Trừ 7 tiếng để lấy lại giờ gốc (UTC)
    const dateInUTC = new Date(dateObj.getTime() + 7 * 60 * 60 * 1000)

    // Lấy thông tin giờ, phút, giây
    const hour = String(dateInUTC.getHours()).padStart(2, "0")
    const minute = String(dateInUTC.getMinutes()).padStart(2, "0")
    const second = String(dateInUTC.getSeconds()).padStart(2, "0")

    // Lấy thông tin ngày, tháng, năm
    const day = String(dateInUTC.getDate()).padStart(2, "0")
    const month = String(dateInUTC.getMonth() + 1).padStart(2, "0") // Tháng bắt đầu từ 0
    const year = dateInUTC.getFullYear()

    return `${hour}:${minute}:${second}-${day}/${month}/${year}`
  } catch (error) {
    console.error("Error parsing date:", error)
    return "Invalid Date"
  }
} // Chuyển đổi thời gian từ ISO 8601 sang định dạng hiển thị: HH:mm:ss-dd/MM/yyyy

export function parseDDMMYYYYDate(dateString: string): Date {
  // Check if the date is in DD/MM/YYYY format
  const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  const match = dateString.match(dateRegex)

  if (match) {
    const day = parseInt(match[1], 10)
    const month = parseInt(match[2], 10) - 1 // Month is 0-indexed in JavaScript
    const year = parseInt(match[3], 10)

    // Create date with the parsed components
    return new Date(year, month, day)
  }

  // Fallback for other formats
  return new Date(dateString)
}

export function parseDurationToMinutes(display: string): number {
  const hours = parseInt(display.split("h")[0] || "0", 10)
  const minutes = parseInt(display.split("h")[1]?.replace("p", "") || "0", 10)
  return hours * 60 + minutes
} // Parse duration from display format to minutes: 30 (minutes)

export function formatMinutesToDisplay(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours}h${mins}p`
} // Format duration from minutes to display format: 2h30p

export function formatSecondsToDisplay(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h${minutes}p`
} // Format duration from seconds to display format: 1h

export function parseDurationToHours(timeString: string): number {
  const hours = parseFloat(timeString.replace("h", ""))
  return hours * 3600
} // Parse duration from display format to hours: 3600 (seconds)

export function validateNameNoSpecialCharacters(str: string) {
  return !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(str)
} // Validate name to ensure it does not contain special characters

export function removeHyphensFromUUID(uuid: string): string {
  return uuid.replace(/-/g, "")
}

export function addHyphensToUUID(uuid: string): string {
  if (uuid.length !== 32) {
    throw responses.response400BadRequest("Invalid UUID")
  }
  return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`
}

export type LogType = "success" | "warning" | "info" | "error"
export async function consoleLogCustom(message: string, data?: any, type: LogType = "info") {
  const { default: chalk } = await import("chalk")
  chalk.level = 3

  const timestamp = new Date().toISOString()

  const icons = {
    success: "✅",
    warning: "⚠️",
    info: "💡",
    error: "❌"
  }

  const colors = {
    success: chalk.green,
    warning: chalk.yellow,
    info: chalk.cyan,
    error: chalk.red
  }

  const label = `[${type.toUpperCase()}] ${icons[type]} - ${formatDate(timestamp)} - MESSAGE: ${message}`

  // In label chính
  console.log(colors[type](label))

  // Nếu có data
  if (data) {
    if (Array.isArray(data)) {
      for (const item of data) {
        if (typeof item === "string") {
          console.log(chalk.cyanBright("⮞"), chalk.green(item))
        } else {
          console.log(chalk.green(JSON.stringify(item, null, 2)))
        }
      }
    } else if (typeof data === "object") {
      console.log(chalk.green(JSON.stringify(data, null, 2)))
    } else {
      console.log(chalk.cyanBright("⮞"), chalk.green(data))
    }
  }
} // chalk@4

export function range(start: number, end: number) {
  const result = []
  for (let i = start; i <= end; i++) {
    result.push(i)
  }
  return result
} // Tạo mảng từ start đến end

export function rangeStepN(start: number, end: number, step: number) {
  const result = []
  for (let i = start; i <= end; i += step) {
    result.push(i)
  }
  return result
} // Tạo mảng từ start đến end với bước nhảy là step

export function fillArrayWithValue<T>(length: number, value: T): T[] {
  return Array.from({ length }, () => value)
} // Tạo mảng có độ dài length và giá trị là value

export function shuffling(array: any[]): any[] {
  const shuffledArray = [...array]
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]]
  }
  return shuffledArray
} // Xáo trộn mảng

export function removeDuplicates<T>(array: T[]): T[] {
  return Array.from(new Set(array))
} // Loại bỏ phần tử trùng lặp trong mảng

export function random(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
} // Tạo số ngẫu nhiên trong khoảng từ min đến max

export function findLargestNumber(arr: number[]): number {
  if (arr.length === 0) {
    throw responses.response400BadRequest("Array cannot be empty")
  }
  return Math.max(...arr)
} // Tìm số lớn nhất trong mảng

export function findSmallestNumber(arr: number[]): number {
  if (arr.length === 0) {
    throw responses.response400BadRequest("Array cannot be empty")
  }
  return Math.min(...arr)
} // Tìm số nhỏ nhất trong mảng

export function pickRandomElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw responses.response400BadRequest("Array cannot be empty")
  }
  const randomIndex = Math.floor(Math.random() * array.length)
  return array[randomIndex]
} // Lấy một phần tử ngẫu nhiên từ mảng

export function toObject<T>(array: T[], key: string): Record<string, T> {
  return array.reduce(
    (obj, item) => {
      if (item && typeof item === "object" && key in item) {
        obj[item[key]] = item
      }
      return obj
    },
    {} as Record<string, T>
  )
} // Chuyển mảng thành đối tượng với key là giá trị của thuộc tính key trong mỗi phần tử

export function generateStrongPassword(): Promise<string> {
  // Character pools
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz"
  const numberChars = "0123456789"
  const specialChars = "@$!%*?&"

  // Ensure at least one character from each required set
  const guaranteedChars = [
    uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)],
    lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)],
    numberChars[Math.floor(Math.random() * numberChars.length)],
    specialChars[Math.floor(Math.random() * specialChars.length)]
  ]

  // Length of password (between 12-16 characters for good security)
  const passwordLength = 12

  // Combined character pool for remaining characters
  const allChars = uppercaseChars + lowercaseChars + numberChars + specialChars

  // Generate remaining characters
  const remainingLength = passwordLength - guaranteedChars.length
  let password = ""

  for (let i = 0; i < remainingLength; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Add the guaranteed characters and shuffle
  password += guaranteedChars.join("")

  // Shuffle the password characters to randomize the positions
  return this.shuffleString(password)
} // Tạo mật khẩu mạnh ngẫu nhiên

function shuffleString(str: string): string {
  const arr = str.split("")
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]] // Swap elements
  }
  return arr.join("")
}
