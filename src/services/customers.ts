import api from "./api"
import type {
  PaginatedResponse,
  PaginationParams,
} from "../types/pagination"

export type Customer = {
  id: number
  name: string
  email?: string
  phone_number?: string
  address?: string
}

export type CustomerPayload = {
  name: string
  email?: string
  phone_number?: string
  address?: string
}

export async function findCustomer(
  phone: string
) {
  const response = await api.get(
    `/orders/customers/search/?phone=${encodeURIComponent(phone)}`
  )

  return response.data
}

export async function listCustomers({
  page,
  pageSize,
  search,
}: PaginationParams & {
  search?: string
} = {}) {
  const params = new URLSearchParams()

  if (search) {
    params.append("search", search)
  }

  if (page) {
    params.append("page", String(page))
  }

  if (pageSize) {
    params.append(
      "page_size",
      String(pageSize)
    )
  }

  const response = await api.get<
    PaginatedResponse<Customer>
  >(
    `/orders/customers/list/?${params.toString()}`
  )

  return response.data
}

export async function createCustomer(
  data: CustomerPayload
) {
  const response = await api.post(
    "/orders/customers/",
    data
  )

  return response.data
}

export async function updateCustomer(
  id: number,
  data: CustomerPayload
) {
  const response = await api.patch<Customer>(
    `/orders/customers/${id}/`,
    data
  )

  return response.data
}

export async function deleteCustomer(
  id: number
) {
  const response = await api.delete(
    `/orders/customers/${id}/`
  )

  return response.data
}
