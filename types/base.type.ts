export interface BaseResponseType<T = any> {
  code: number,
  message: string,
  data: T,
  error: AppErrorType | null
}

export interface RequestWithPaginationType {
  page: number
  size: number
  keyword?: string
}

export interface ResponseWithPaginationType<T = any> {
  total: number
  totalPage: number
  items: T
}

export interface AppErrorType {
  property?: string | null,
  message: string
}

export interface AppPagingType {
  total: number
  page: number
  limit: number
  totalPage: number
}

export interface PieChartType {
  title: string
  value: number
  color: string
}

export interface ColumnChartType {
  labels: string[]
  datasets: {
    label?: string
    data: number[],
    backgroundColor: string[]
    borderColor: string[]
    borderWidth: number
  }[]
}