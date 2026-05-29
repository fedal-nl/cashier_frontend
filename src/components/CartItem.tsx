import type { CartItem as CartItemType } from "../types/cart"
import { formatCurrency } from "../utils/formatters"

type Props = {
  item: CartItemType
  index: number
  onRemove: (index: number) => void
  onAdd: (index: number) => void
}

export default function CartItemComponent({
  item,
  index,
  onRemove,
  onAdd,
}: Props) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">

      {/* Top: name */}
      <div className="font-semibold text-right mb-1 truncate">
        {item.menuItem.name_ar}
      </div>

      {/* Middle: quantity × price */}
      <div className="text-sm text-gray-600 text-right mb-2">
        {item.quantity} × {formatCurrency(Number(item.menuItem.price))}
      </div>

      {/* Bottom: total + controls */}
      <div className="flex items-center justify-between">

        {/* Controls */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => onRemove(index)}
            className="w-9 h-9 bg-red-500 text-white rounded-xl"
          >
            −
          </button>

          <button
            onClick={() => onAdd(index)}
            className="w-9 h-9 bg-green-500 text-white rounded-xl"
          >
            +
          </button>
        </div>

        {/* Price */}
        <div className="text-sm font-semibold text-green-600 text-left">
          {formatCurrency(item.totalPrice)}
        </div>

      </div>
    </div>
  )
}