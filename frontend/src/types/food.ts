export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'CARD' | 'ESEWA' | 'KHALTI' | 'CASH_ON_DELIVERY' | 'BANK_TRANSFER';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface MenuItem {
  id: number;
  restaurantId: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  isPopular?: boolean;
  prepTime: string;
  isAvailable?: boolean; // toggle availability ("sold out today")
  isVeg?: boolean; // veggie indicator (green dot = veg, brown/red square = non-veg)
  spiceOptions?: boolean; // spice selector applicable (Mild/Medium/Hot)
  ingredients?: string[]; // ingredients list
  allergens?: string[]; // allergens list
  moods?: string[]; // mood tag list
  cuisine?: string; // cuisine type (e.g. Nepali, Indian, Italian, Chinese)
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  image: string;
  prepTime: string;
  deliveryFee: number;
  menu: MenuItem[];
}

export interface Address {
  id: string;
  label: string;
  address: string;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
  addresses: Address[];
}

export interface ThaliComponent {
  name: string;
  price: number;
}

export interface CustomThali {
  base: ThaliComponent;
  curries: ThaliComponent[];
  achar: ThaliComponent;
  extras: ThaliComponent[];
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  spiceLevel?: 'Mild' | 'Medium' | 'Hot';
  customThali?: CustomThali;
}

export interface CartDisplayItem {
  menuItem: MenuItem;
  quantity: number;
  spiceLevel?: 'Mild' | 'Medium' | 'Hot';
  customThali?: CustomThali;
  participant?: string;
}

export interface Order {
  orderId: number;
  restaurantId: string;
  restaurantName: string;
  customer: Customer;
  items: OrderItem[];
  orderTime: string;
  deliveryCharge: number;
  subtotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  paymentId?: string;
  deliveryType: 'DELIVERY' | 'PICKUP';
  cancellationReason?: string;
}

export interface GroupCartItem {
  id: string;
  participant: string;
  menuItem: MenuItem;
  quantity: number;
  spiceLevel?: 'Mild' | 'Medium' | 'Hot';
  customThali?: CustomThali;
}

export interface GroupSession {
  id: string;
  hostName: string;
  participants: string[];
  splitMethod: 'HOST_PAYS' | 'EQUAL_SPLIT';
}
