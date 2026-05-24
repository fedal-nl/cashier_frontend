import type { Category } from "../types/menu";

type Props = {
  category: Category;
  isSelected: boolean;
  onSelect: (category: Category) => void;
};

export default function CategoryButton({
  category,
  isSelected,
  onSelect,
}: Props) {
  return (
    console.log("Rendering CategoryButton for category:", category.name_ar, "isSelected:", isSelected),
    <button
      onClick={() => onSelect(category)}
      className={`w-full h-16 mb-2 rounded-xl text-lg font-semibold transition ${
        isSelected
          ? "bg-blue-500 text-white"
          : "bg-white active:bg-gray-200"
      }`}
      >
      {category.name_ar}
    </button>
  );
}
