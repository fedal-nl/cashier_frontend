import type { Category } from "../types/menu";
import { Button } from "react-bootstrap";

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
<Button
      variant={isSelected ? "primary" : "outline-secondary"}
      size="lg"
      className="w-100 mb-2 py-4 fs-5"
      onClick={() => onSelect(category)}
    >
      {category.name_ar}
    </Button>
  );
}
