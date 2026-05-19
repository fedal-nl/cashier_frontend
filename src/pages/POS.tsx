import { useEffect, useState } from "react"
import { fetchMenu } from "../services/api"
import type { Category } from "../types/menu"

export default function POS() {
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

  useEffect(() => {
    fetchMenu()
      .then((data) => {
        setCategories(data)
        setSelectedCategory(data[0])
      })
      .catch((err) => console.error(err))
  }, [])

  return (
    <div className="flex h-screen">
      {/* Categories */}
      <div className="w-1/5 bg-gray-100 p-2 overflow-y-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat)}
            className={`w-full h-16 mb-2 rounded-xl text-lg font-semibold ${
              selectedCategory?.id === cat.id
                ? "bg-blue-500 text-white"
                : "bg-white"
            }`}
          >
            {cat.name_ar}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="w-3/5 p-2 grid grid-cols-3 gap-3">
        {selectedCategory?.items.map((item) => (
          <div
            key={item.id}
            className="h-24 bg-white rounded-xl shadow flex flex-col justify-center items-center"
          >
            <span className="text-lg font-bold">{item.name_ar}</span>
            <span className="text-sm text-gray-500">{item.price} €</span>
          </div>
        ))}
      </div>

      {/* Cart */}
      <div className="w-1/5 bg-gray-50 p-2 border-l">
        Cart
      </div>
    </div>
  )
}