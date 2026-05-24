import CategoryButton from "./CategoryButton"
import { type Category } from "../types/menu"

type Props = {
  categories: Category[];
  selectedCategory: Category | null;
  setSelectedCategory: (category: Category) => void;
};

export default function CategoryList({ categories, selectedCategory, setSelectedCategory }: Props) {
    return (
        <div className="w-1/5 bg-blue-100 p-2 overflow-y-auto">
            {categories.map((cat) => (
                <CategoryButton
                key={cat.id}
                category={cat}
                isSelected={selectedCategory?.id === cat.id}
                onSelect={setSelectedCategory}
                />
            ))}
        </div>
    )
}