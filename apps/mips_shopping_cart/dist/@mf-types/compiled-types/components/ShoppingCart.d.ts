export interface Product {
    id: string;
    name: string;
    price: number;
}
export interface CartItem {
    instanceId: string;
    product: Product;
}
interface ShoppingCartPageProps {
    items: CartItem[];
    onRemoveFromCart: (instanceId: string) => void;
}
declare const ShoppingCartPage: ({ items, onRemoveFromCart, }: ShoppingCartPageProps) => import("react/jsx-runtime").JSX.Element;
export default ShoppingCartPage;
