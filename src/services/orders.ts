import axios from "axios"
import type { CartItem } from "../types/cart"

const API_URL = "/api"

type CustomerPayload = {
  name: string
  phone_number?: string
  address?: string
  email?: string
}

export async function createCustomer(
  customer: CustomerPayload
) {
  const response = await axios.post(
    `${API_URL}/orders/customers/`,
    customer
  )
//   if (response.status !== 201) {
//     throw new Error("Failed to create customer")
//   }
  console.log("Customer creation response:", response)
  console.log("Customer created:", response.data)

  return response.data
}

export async function createOrder(
  customerId: number,
  cartItems: CartItem[]
) {
  const payload = {
    customer_id: customerId,
    status: "created",
    items: cartItems.map((item) => ({
      menu_item_id: item.menuItem.id,
      quantity: item.quantity,
      order_item_note: item.note || "",
      modifications:
        item.modifications?.map((mod) => ({
          ingredient_id:
            mod.ingredient.ingredient_id,
          type: mod.type,
        })) || [],
    })),
  }

  const response = await axios.post(
    `${API_URL}/orders/`,
    payload
  )

  return response.data
}