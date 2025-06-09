export type AccountPayload = {
  id: string
  email: string
  role: string
}

export type JWTResponse = {
  account: AccountPayload
  accessToken: string
  expiresAccess: Date
  refreshToken: string
  expiresRefresh: Date
}

export type Pagination = {
  pageSize: number
  totalItem: number
  currentPage: number
  maxPageSize: number
  totalPage: number
}

export enum Gender {
  MALE,
  FEMALE,
  OTHER
}

export type RefreshResponse = {
  accessToken: string
  expiresAccess: Date
  refreshToken: string
}

export enum Role {
  USER,
  STAFF,
  ADMIN
}
