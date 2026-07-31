import api from "./api"

export type OrderSnapshotItem = {
  menu_item_id: number
  name_ar: string
  quantity: number
  base_price: string
  total_price: string
  note: string
  modifications: Array<{
    ingredient_id: number
    name_ar: string
    type: string
    quantity: number
    price: string
  }>
}

export type OrderSnapshot = {
  created_at?: string
  updated_at?: string
  customer_id: number | null
  branch_id: number
  delivery_company_id: number | null
  status: string
  order_type: string
  note: string
  total_price: string
  items: OrderSnapshotItem[]
}

export type OrderLog = {
  id: number
  order_id: string
  customer: { id: number; name: string } | null
  event_type: "created" | "status_updated" | "modified"
  previous_status: string | null
  new_status: string
  created_by_username: string | null
  changes: {
    before?: OrderSnapshot
    after?: OrderSnapshot
  }
  created_at: string
  updated_at: string
}

export type OrderLogFilters = {
  status?: string
  eventType?: OrderLog["event_type"] | ""
  orderId?: string
  lastUpdated?: string
  page?: number
  pageSize?: number
}

export type PaginatedOrderLogs = {
  count: number
  next: string | null
  previous: string | null
  results: OrderLog[]
}

export async function fetchOrderLogs(filters: OrderLogFilters = {}) {
  const params = new URLSearchParams()

  if (filters.status) params.set("status", filters.status)
  if (filters.eventType) params.set("event_type", filters.eventType)
  if (filters.orderId) params.set("order_id", filters.orderId)
  if (filters.lastUpdated) params.set("last_updated", filters.lastUpdated)
  if (filters.page) params.set("page", String(filters.page))
  if (filters.pageSize) params.set("page_size", String(filters.pageSize))

  const response = await api.get<PaginatedOrderLogs>(
    `/orders/logs/${params.size ? `?${params.toString()}` : ""}`
  )

  return response.data
}
