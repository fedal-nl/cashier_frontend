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
  items: OrderItemPayload[]
  note?: string
  status: string
}

export type DeliveryCompany = {
  id: number
  name?: string
  phone_number?: string
  website?: string
  contact_person?: string
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
