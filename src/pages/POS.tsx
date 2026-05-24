import { useEffect, useState } from "react"
import { fetchMenu } from "../services/api"
import type { Category, MenuItem } from "../types/menu"
import CategoryList from "../components/CategoryList"
import MenuItemGrid from "../components/MenuItemGrid"
import MenuItemModal from "../components/MenuItemModal"


export default function POS() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  useEffect(() => {
    fetchMenu()
      .then((data) => {
        setCategories(data)
        setSelectedCategory(data[0])
      })
      .catch((err) => console.error(err))
  }, [])

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
      <div className="w-1/5 bg-blue-100 p-2 border-l">
        Cart
      </div>

      {/* Item Modal */}
      {selectedItem && (
        <MenuItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

    </div>
  )
}