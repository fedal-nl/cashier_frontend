import type { CartItem } from "../types/cart"
import { formatCurrency } from "../utils/formatters"
import CartItemComponent from "./CartItem"

type Props = {
  cartItems: CartItem[]
  onRemove: (index: number) => void
  onAdd: (index: number) => void
}

export default function CartPanel({ cartItems, onRemove, onAdd }: Props) {
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.totalPrice,
    0
  )

  return (
    <div className="w-1/5 h-full bg-gray-50 border-l flex flex-col">

      {/* Header */}
      <div className="p-3 border-b">
        <h2 className="text-lg font-bold text-right">
          الطلب الحالي
        </h2>
      </div>

      {/* Items (scrollable ONLY here) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {cartItems.length === 0 && (
          <div className="text-center text-gray-400 mt-10">
            لا توجد عناصر
          </div>
        )}

        {cartItems.map((item, index) => (
          <CartItemComponent
            key={index}
            item={item}
            index={index}
            onRemove={onRemove}
            onAdd={onAdd}
          />
        ))}
      </div>

      {/* Footer (always visible) */}
      <div className="p-3 border-t bg-white">
        <div className="text-sm text-gray-500 text-right">
          المجموع
        </div>
        <div className="text-xl font-bold text-right text-green-600">
          {formatCurrency(totalAmount)}
        </div>
      </div>

    </div>
  )
}