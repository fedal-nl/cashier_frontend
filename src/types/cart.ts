import type {MenuItem} from "./menu";

export type CartItem = {
    menuItem: MenuItem;
    quantity: number;
    totalPrice: number;
    selectedIngredients: number[] | null; // Array of ingredient IDs
}
