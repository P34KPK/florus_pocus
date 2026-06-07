"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { z } from "zod";
import type { CartItem, CartState, ProductType } from "@/types";

const CartItemSchema = z.object({
  cartId:      z.string().min(1).max(200),
  type:        z.enum(["product", "subscription", "autocueillette"]),
  referenceId: z.string().uuid(),
  name:        z.string().min(1).max(500),
  price:       z.number().nonnegative().max(100_000),
  quantity:    z.number().int().min(1).max(999),
  imageUrl:    z.string().url().nullable().optional(),
  metadata:    z.object({
    frequency:          z.enum(["1x_month", "2x_month", "4x_month"]).optional(),
    dropoff_point_id:   z.string().optional(),
    dropoff_point_name: z.string().optional(),
    event_date:         z.string().optional(),
  }).optional(),
});

const CartStorageSchema = z.array(CartItemSchema).max(50);

/* ── Actions ──────────────────────────────────────────────── */
type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { cartId: string } }
  | { type: "UPDATE_QUANTITY"; payload: { cartId: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "OPEN_CART" }
  | { type: "CLOSE_CART" }
  | { type: "HYDRATE"; payload: CartItem[] };

const CART_STORAGE_KEY = "floruspocus_cart";

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existing = state.items.find((i) => i.cartId === action.payload.cartId);
      if (existing) {
        return {
          ...state,
          items: state.items.map((i) =>
            i.cartId === action.payload.cartId
              ? { ...i, quantity: i.quantity + action.payload.quantity }
              : i
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case "REMOVE_ITEM":
      return { ...state, items: state.items.filter((i) => i.cartId !== action.payload.cartId) };
    case "UPDATE_QUANTITY":
      if (action.payload.quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.cartId !== action.payload.cartId) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.cartId === action.payload.cartId ? { ...i, quantity: action.payload.quantity } : i
        ),
      };
    case "CLEAR_CART":
      return { ...state, items: [] };
    case "OPEN_CART":
      return { ...state, isOpen: true };
    case "CLOSE_CART":
      return { ...state, isOpen: false };
    case "HYDRATE":
      return { ...state, items: action.payload };
    default:
      return state;
  }
}

/* ── Context ──────────────────────────────────────────────── */
interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  itemCount: number;
  total: number;
  addProduct: (product: { id: string; name: string; price: number; image_url?: string | null }) => void;
  addSubscription: (sub: {
    id: string;
    name: string;
    price: number;
    dropoff_point_id: string;
    dropoff_point_name: string;
  }) => void;
  removeItem: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

/* ── Provider ─────────────────────────────────────────────── */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], isOpen: false });
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = CartStorageSchema.safeParse(JSON.parse(stored));
        if (parsed.success) {
          dispatch({ type: "HYDRATE", payload: parsed.data as CartItem[] });
        } else {
          localStorage.removeItem(CART_STORAGE_KEY);
        }
      }
    } catch { /* corrupted storage */ }
    setHydrated(true);
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state.items));
    } catch { /* storage full */ }
  }, [state.items, hydrated]);

  function makeCartId(type: ProductType, referenceId: string, suffix = "") {
    return `${type}_${referenceId}${suffix ? `_${suffix}` : ""}`;
  }

  function addProduct(product: { id: string; name: string; price: number; image_url?: string | null }) {
    const cartId = makeCartId("product", product.id);
    dispatch({
      type: "ADD_ITEM",
      payload: { cartId, type: "product", referenceId: product.id, name: product.name, price: product.price, quantity: 1, imageUrl: product.image_url },
    });
  }

  function addSubscription(sub: {
    id: string; name: string; price: number;
    dropoff_point_id: string; dropoff_point_name: string;
  }) {
    const cartId = makeCartId("subscription", sub.id, sub.dropoff_point_id);
    dispatch({
      type: "ADD_ITEM",
      payload: {
        cartId, type: "subscription", referenceId: sub.id,
        name: sub.name,
        price: sub.price, quantity: 1,
        metadata: { dropoff_point_id: sub.dropoff_point_id, dropoff_point_name: sub.dropoff_point_name },
      },
    });
  }

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const total     = Math.round(state.items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100;

  return (
    <CartContext.Provider value={{
      items: state.items, isOpen: state.isOpen, itemCount, total,
      addProduct, addSubscription,
      removeItem: (cartId) => dispatch({ type: "REMOVE_ITEM", payload: { cartId } }),
      updateQuantity: (cartId, quantity) => dispatch({ type: "UPDATE_QUANTITY", payload: { cartId, quantity } }),
      clearCart: () => dispatch({ type: "CLEAR_CART" }),
      openCart: () => dispatch({ type: "OPEN_CART" }),
      closeCart: () => dispatch({ type: "CLOSE_CART" }),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
