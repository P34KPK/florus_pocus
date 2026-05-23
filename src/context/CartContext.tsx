"use client";

import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, CartState, ProductType, SubscriptionFrequency } from "@/types";

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
    price_monthly: number;
    frequency: SubscriptionFrequency;
    dropoff_point_id: string;
    dropoff_point_name: string;
  }) => void;
  addAutocueillette: (event: {
    id: string;
    event_date: string;
    price_per_ticket: number;
    quantity: number;
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
        dispatch({ type: "HYDRATE", payload: JSON.parse(stored) });
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
    id: string; name: string; price_monthly: number;
    frequency: SubscriptionFrequency; dropoff_point_id: string; dropoff_point_name: string;
  }) {
    const cartId = makeCartId("subscription", sub.id, `${sub.frequency}_${sub.dropoff_point_id}`);
    const freqLabel: Record<SubscriptionFrequency, string> = {
      "1x_month": "1×/mois", "2x_month": "2×/mois", "4x_month": "4×/mois",
    };
    dispatch({
      type: "ADD_ITEM",
      payload: {
        cartId, type: "subscription", referenceId: sub.id,
        name: `${sub.name} — ${freqLabel[sub.frequency]}`,
        price: sub.price_monthly, quantity: 1,
        metadata: { frequency: sub.frequency, dropoff_point_id: sub.dropoff_point_id, dropoff_point_name: sub.dropoff_point_name },
      },
    });
  }

  function addAutocueillette(event: { id: string; event_date: string; price_per_ticket: number; quantity: number }) {
    const cartId = makeCartId("autocueillette", event.id);
    const date = new Date(event.event_date).toLocaleDateString("fr-CA", { month: "long", day: "numeric", year: "numeric" });
    dispatch({
      type: "ADD_ITEM",
      payload: {
        cartId, type: "autocueillette", referenceId: event.id,
        name: `Autocueillette — ${date}`, price: event.price_per_ticket, quantity: event.quantity,
        metadata: { event_date: event.event_date },
      },
    });
  }

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const total     = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items: state.items, isOpen: state.isOpen, itemCount, total,
      addProduct, addSubscription, addAutocueillette,
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
