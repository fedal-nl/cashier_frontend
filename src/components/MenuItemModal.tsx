import type { MenuItem } from "../types/menu"
import { formatCurrency } from "../utils/formatters"

type Props = {
  item: MenuItem
  onClose: () => void
}

export default function MenuItemModal({ item, onClose }: Props) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl w-[400px] p-6 shadow-xl">
        
        {/* Title */}
        <h2 className="text-xl font-bold mb-2 text-right">
          {item.name_ar}
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-4 text-right">
          {item.description_ar || "لا يوجد وصف"}
        </p>

        {/* Price */}
        <div className="text-lg font-semibold text-green-600 mb-6 text-right">
          {formatCurrency(Number(item.price))}
        </div>

        {/* Actions */}
        <div className="flex justify-stretch gap-4">
          <button
            onClick={onClose}
            className="w-full h-14 bg-blue-500 text-white text-lg rounded-xl"
          >
            إلغاء
          </button>
                    <button
            onClick={onClose}
            className="w-full h-14 bg-blue-500 text-white text-lg rounded-xl"
          >
            إضافة إلى الطلب
          </button>
        </div>
      </div>
    </div>
  )
}