import {type MenuItem} from "../types/menu"
import { formatCurrency } from "../utils/formatters"

type Props = {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
};

export default function MenuItemButton({ item, onClick }: Props) {
  return (
          <button
            key={item.id}
            onClick={() => onClick(item)}
            className="w-full h-28 bg-green-100 rounded-xl shadow flex flex-col justify-center items-center">
            <span className="text-lg font-bold">{item.name_ar}</span>
            <span className="text-sm text-gray-500">{formatCurrency(Number(item.price))}</span>
          </button>
  )
}