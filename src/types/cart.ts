import type {MenuItem, Ingredient} from "./menu";

export type CartModification = {
  ingredient: Ingredient
  type: "added" | "removed"
}

export type CartItem = {
  menuItem: MenuItem
  quantity: number
  totalPrice: number
  note?: string
  modifications?: CartModification[]
}