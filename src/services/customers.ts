import api from "./api"

export async function findCustomer(
  phone: string
) {
  const response = await api.get(
    `/orders/customers/search/?phone=${phone}`
  )

  return response.data
}

export async function createCustomer(data: {
  name: string
  phone_number?: string
  address?: string
}) {
  const response = await api.post(
    "/orders/customers/",
    data
  )

  return response.data
}