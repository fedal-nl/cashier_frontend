/**
 * Point of Sale (POS) Page
 * This page is the main interface for the cashier to take orders.
 * It displays categories, menu items, and a cart summary.
 * The cashier can select items, customize them, and add them to the cart.
 * I was planing to make it the main page of the app but I changed my mind and made it a separate page to keep things simple for now.
 * I might integrate it later on when I have more time to work on the app.
 */
import { useEffect, useState } from "react"
import { fetchMenu } from "../services/api"
import type { Category, MenuItem } from "../types/menu"
import CategoryList from "../components/CategoryList"
import MenuItemGrid from "../components/MenuItemGrid"
import MenuItemModal from "../components/MenuItemModal"
import CartPanel from "../components/CartPanel"


export default function POS() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [cartItems, setCartItems] = useState<any[]>([]) // This will hold the items added to the cart

  useEffect(() => {
    fetchMenu()
      .then((data) => {
        setCategories(data)
        setSelectedCategory(data[0])
      })
      .catch((err) => console.error(err))
  }, [])

  function handleAddToCart(item: MenuItem) {
    // This function will handle adding items to the cart
    console.log("Adding to cart:", item)
    setCartItems((prev) => {
      const existingItemIndex = prev.findIndex((cartItem) => cartItem.menuItem.id === item.id)
      if (existingItemIndex !== -1) {
        // If the item already exists in the cart, update the quantity and total price
        const updatedCart = [...prev]
        const existingItem = updatedCart[existingItemIndex]
        existingItem.quantity += 1
        existingItem.totalPrice += item.price
        return updatedCart
      } else {
        // If the item is new to the cart, add it with quantity 1
        return [...prev, { menuItem: item, quantity: 1, totalPrice: item.price, selectedIngredients: null }]
      }
    })
  }

  function handleRemoveFromCart(index: number) {
    // This function will handle removing items from the cart
    setCartItems((prev) => {
      const updatedCart = [...prev]
      const item = updatedCart[index]
      if (item.quantity > 1) {
        // If the quantity is more than 1, decrease the quantity and total price
        item.quantity -= 1
        item.totalPrice -= item.menuItem.price
        return updatedCart
      } else {
        // If the quantity is 1, remove the item from the cart
        updatedCart.splice(index, 1)
        return updatedCart
      }
    })
  }

  function increase(id: number) {
    console.log("Increasing item with id:", id)
    setCartItems((prev) =>
      prev.map((i) =>
        i.menuItem.id === id
          ? {
              ...i,
              quantity: i.quantity + 1,
              totalPrice: (i.quantity + 1) * Number(i.menuItem.price),
            }
          : i
      )
    )
  }

  function decrease(id: number) {
    console.log("Decreasing item with id:", id)
    setCartItems((prev) =>
      prev
        .map((i) =>
          i.menuItem.id === id
            ? {
                ...i,
                quantity: i.quantity - 1,
                totalPrice: (i.quantity - 1) * Number(i.menuItem.price),
              }
            : i
        )
        .filter((i) => i.quantity > 0)
    )
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Categories */}
      <CategoryList
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      />
      {/* Menu Items */}
      <MenuItemGrid selectedCategory={selectedCategory} onItemClick={setSelectedItem} />

      {/* Cart */}
        <CartPanel
          cartItems={cartItems}
          onRemove={decrease}
          onAdd={increase}
        />

      {/* Item Modal */}
      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAdd={handleAddToCart}
        />
      )}

    </div>
  )
}