import CategoryButton from "./CategoryButton"
import { type Category } from "../types/menu"

type Props = {
  categories: Category[];
  selectedCategory: Category | null;
  onSelect: (category: Category) => void;
};

export default function CategoryList({ categories, selectedCategory, onSelect }: Props) {
    return (
        <>
        {categories.map((category) => (
            <CategoryButton
            key={category.id}
            category={category}
            isSelected={selectedCategory?.id === category.id}
            onSelect={onSelect}
            />
        ))}
        </>
    )
}
