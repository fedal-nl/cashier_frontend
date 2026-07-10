import api from "./api"
import type {
  PaginatedResponse,
  PaginationParams,
} from "../types/pagination"

type OrderModificationPayload = {
  ingredient_id: number
  type: "added" | "removed"
  quantity: number
  name_ar: string
}

type OrderItemPayload = {
  menu_item_id: number
  quantity: number
  note?: string
  modifications: OrderModificationPayload[]
}

type CreateOrderPayload = {
  customer_id?: number | null
  branch_id: number
  delivery_company_id?: number | null
  order_type: string
  items: OrderItemPayload[]
  note?: string
  status: string
}

export type OrderCustomer = {
  id: number
  name: string
  email?: string
  phone_number?: string
  address?: string
}

export type OrderBranch = {
  id: number
  name: string
  location?: string
  is_active: boolean
}

export type DeliveryCompany = {
  id: number
  name?: string
  phone_number?: string
  website?: string
  contact_person?: string
}

export type OrderType = {
  value: string
  label_ar: string
}

export type OrderItemModification = {
  id: number
  ingredient_id: number
  ingredient_name_ar: string
  ingredient_price: string
  unit_id?: number | null
  unit_name_ar?: string | null
  quantity: number
  modification_type: "added" | "removed"
}

export type OrderItem = {
  id: number
  menu_item_id: number
  menu_item_name_ar: string
  menu_item_base_price: string
  quantity: number
  total_price: string
  order_item_note?: string
  modifications: OrderItemModification[]
}

export type OrderDetail = {
  id: string
  customer: OrderCustomer | null
  branch: OrderBranch
  delivery_company?: DeliveryCompany | null
  status: string
  order_type: string
  order_type_label_ar: string
  note?: string
  created_at: string
  updated_at: string
  total_price: string
  items: OrderItem[]
}

export type TodayOrderSummary = {
  branch_id: number
  branch_name: string
  total_orders: number
  total_revenue: string
  total_existing_customers_ordered: number
  total_new_customers_ordered: number
  orders_by_status: Record<string, number>
}

type TodayOrderSummaryResponse =
  | TodayOrderSummary
  | TodayOrderSummary[]

type UpdateOrderStatusPayload = {
  status: string
  delivery_company_id?: number
}

export async function createOrder(
  payload: CreateOrderPayload
) {
  const response = await api.post(
    "/orders/",
    payload
  )

  return response.data
}

export async function updateOrder(
  orderId: string,
  payload: CreateOrderPayload
) {
  const response = await api.put(
    `/orders/${orderId}/`,
    payload
  )

  return response.data
}

export async function fetchOrders(
  params: PaginationParams & {
    search?: string
    customer?: string
    status?: string
  } = {}
) {
  const query = new URLSearchParams()

  if (params.search) {
    query.append("search", params.search)
  }

  if (params.customer) {
    query.append("customer", params.customer)
  }

  if (params.status) {
    query.append("status", params.status)
  }

  if (params.page) {
    query.append("page", String(params.page))
  }

  if (params.pageSize) {
    query.append(
      "page_size",
      String(params.pageSize)
    )
  }

  const response = await api.get<
    PaginatedResponse<OrderDetail>
  >(
    `/orders/list/?${query.toString()}`
  )

  return response.data
}

/**
 * Fetches today's order, revenue, status, and customer summary totals.
 */
export async function fetchTodayOrderSummary() {
  const response = await api.get<TodayOrderSummaryResponse>(
    "/orders/summary/today/"
  )

  if (Array.isArray(response.data)) {
    return response.data
  }

  return [
    {
      ...response.data,
      branch_id:
        response.data.branch_id ?? 0,
      branch_name:
        response.data.branch_name ??
        "كل الفروع",
    },
  ]
}

export async function fetchOrder(
  orderId: string
) {
  const response = await api.get<OrderDetail>(
    `/orders/${orderId}/`
  )

  return response.data
}

export async function fetchDeliveryCompanies() {
  const response = await api.get<DeliveryCompany[]>(
    "/orders/delivery-companies/"
  )

  return response.data
}

export async function fetchOrderTypes() {
  const response = await api.get<OrderType[]>(
    "/orders/types/"
  )

  return response.data
}

export async function updateOrderStatus(
  orderId: string,
  payload: UpdateOrderStatusPayload
) {
  const response = await api.patch(
    `/orders/${orderId}/status/`,
    payload
  )

  return response.data
}
