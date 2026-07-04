export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentMethod = 'WALLET' | 'CARD' | 'UPI' | 'CASH_ON_DELIVERY';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  isPopular?: boolean;
  prepTime: string;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
  walletBalance: number;
}

export interface WalletTransaction {
  id: string;
  timestamp: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceAfter: number;
  description: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  orderId: number;
  customer: Customer;
  items: OrderItem[];
  orderTime: string;
  deliveryCharge: number;
  subtotal: number;
  total: number;
  paymentMethod?: PaymentMethod;
  paymentStatus?: PaymentStatus;
  status: OrderStatus;
  paymentId?: string;
}
