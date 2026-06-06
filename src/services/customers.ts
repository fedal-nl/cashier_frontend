import api from "./api"

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

export async function listCustomers() {
  const response = await api.get<Customer[]>(
    "/orders/customers/list/"
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
