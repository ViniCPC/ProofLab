export interface ApiError {
  statusCode: number
  message: string
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TransactionResponse {
  transaction: string
}
