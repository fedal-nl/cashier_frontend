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
  ingredient_id: number
  ingredient_name_ar: string
  price: string
  unit_id: number
  unit_name_ar: string
  is_default: boolean
  is_removable: boolean
  is_addable: boolean
};

export type MenuItem = {
  id: number
  name_ar: string
  description_ar?: string
  price: string
  category_id: number
  category_name_ar: string
  quantity: number
  unit_id: number
  unit_name_ar: string
  image?: string
  is_active: boolean
  ingredients: Ingredient[]
}