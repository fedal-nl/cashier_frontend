import MenuItemButton from "./MenuItemButton"
import type { Category } from "../types/menu"

type Props = {
  selectedCategory: Category | null;
  onItemClick?: (item: any) => void;
};

export default function MenuItemGrid({ selectedCategory, onItemClick }: Props) {
  return (
    <div className="w-3/5 p-2 grid grid-cols-2 gap-4 content-start">
      {selectedCategory?.items.map((item) => (
        <MenuItemButton key={item.id} item={item} onClick={() => onItemClick?.(item)} />
      ))}
    </div>
  )
}
