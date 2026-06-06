/* ── Database Models ────────────────────────────────────────── */

export interface Page {
  id: string;
  slug: "hero" | "why-local" | "farm" | "contact";
  title: string;
  description: string;
  featured_image_url: string | null;
  meta_description: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export type ProductCategory = "fleur" | "transforme";

export interface Product {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price: number;
  florist_price: number | null;
  florist_only: boolean;
  stock: number | null;
  image_url: string | null;
  season: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type SubscriptionFrequency = "1x_month" | "2x_month" | "4x_month";

export interface Subscription {
  id: string;
  name: string;
  description: string;
  price: number;
  format: string;
  frequencies: SubscriptionFrequency[];
  active: boolean;
  dropoff_points?: DropoffPoint[];
  created_at: string;
  updated_at: string;
}

export interface DropoffPoint {
  id: string;
  subscription_id: string;
  name: string;
  address: string;
  days_available: number[]; // 0=Mon … 6=Sun
  hours_start: string;      // "HH:MM"
  hours_end: string;        // "HH:MM"
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image_url: string | null;
  excerpt: string;
  tags: string[];
  author: string;
  published: boolean;
  published_date: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus  = "pending" | "paid" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "completed" | "failed";
export type ProductType  = "product" | "subscription" | "autocueillette";

export interface Order {
  id: string;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  customer_address: string;
  total_amount: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  square_transaction_id: string | null;
  square_payment_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_type: ProductType;
  quantity: number;
  price_per_unit: number;
  metadata: {
    frequency?: SubscriptionFrequency;
    dropoff_point_id?: string;
    dropoff_point_name?: string;
    event_date?: string;
    subscription_name?: string;
    product_name?: string;
  };
  created_at: string;
}

export interface MangeMoiItem {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

/* ── Cart ───────────────────────────────────────────────────── */

export interface CartItem {
  cartId: string; // unique key per cart slot
  type: ProductType;
  referenceId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  metadata?: {
    frequency?: SubscriptionFrequency;
    dropoff_point_id?: string;
    dropoff_point_name?: string;
    event_date?: string;
  };
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}
