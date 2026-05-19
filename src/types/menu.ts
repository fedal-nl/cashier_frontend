export type Unit = {
    id: number;
    name_ar: string;
}

export type Category = {
    id: number;
    name_ar: string;
    items: MenuItem[];
}

export type Ingredient = {
  id: number;
  name_ar: string;
  price: number;
  is_default: boolean;
  is_removable: boolean;
  is_addable: boolean;
  unit: Unit;
};

export type MenuItem = {
    id: number;
    name_ar: string;
    price: number;
    ingredients: Ingredient[];
    category: Category;
}