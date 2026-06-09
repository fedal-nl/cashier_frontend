import api from "./api"

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
  customer_id: number
  branch_id?: number
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
  customer: OrderCustomer
  branch?: OrderBranch | null
  delivery_company?: DeliveryCompany | null
  status: string
  note?: string
  created_at: string
  updated_at: string
  total_price: string
  items: OrderItem[]
}

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

export async function fetchOrders(
  search?: string,
  customer?: string,
  status?: string
) {
  const params = new URLSearchParams()

  if (search) {
    params.append("search", search)
  }

  if (customer) {
    params.append("customer", customer)
  }

  if (status) {
    params.append("status", status)
  }

  const response = await api.get(
    `/orders/list/?${params.toString()}`
  )

  return response.data
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
