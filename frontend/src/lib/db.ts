import { Customer, Order, MenuItem, Restaurant, OrderStatus, PaymentMethod, PaymentStatus } from '../types/food';
import { mockRestaurants as initialRestaurants } from '../data/mockData';

// Global persistence for Next.js hot-reloads
declare global {
  var dbUsers: Record<string, Customer> | undefined;
  var dbOrders: Order[] | undefined;
  var dbRestaurants: Restaurant[] | undefined;
}

if (!globalThis.dbUsers) globalThis.dbUsers = {};
if (!globalThis.dbOrders) globalThis.dbOrders = [];
if (!globalThis.dbRestaurants) {
  globalThis.dbRestaurants = JSON.parse(JSON.stringify(initialRestaurants)).map((rest: Restaurant) => ({
    ...rest,
    menu: rest.menu.map(item => ({ ...item, isAvailable: item.isAvailable !== false }))
  }));
}

const users = globalThis.dbUsers!;
const orders = globalThis.dbOrders!;
const restaurants = globalThis.dbRestaurants!;

// Rate limiting in-memory storage
const rateLimits = new Map<string, { count: number; resetTime: number }>();

export function isRateLimited(key: string, limit = 5, windowMs = 60000): boolean {
  const now = Date.now();
  const record = rateLimits.get(key);
  
  if (!record) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  if (now > record.resetTime) {
    rateLimits.set(key, { count: 1, resetTime: now + windowMs });
    return false;
  }
  
  record.count++;
  return record.count > limit;
}

export function getUser(phone: string): Customer | null {
  return users[phone] || null;
}

export function registerUser(name: string, phone: string, address: string): Customer {
  if (!users[phone]) {
    users[phone] = {
      name,
      phone,
      address,
      addresses: [
        { id: 'addr-home', label: 'Home', address }
      ]
    };
  } else {
    users[phone].name = name;
    users[phone].address = address;
  }
  return users[phone];
}

export function addAddress(phone: string, label: string, address: string): Customer {
  const user = users[phone];
  if (!user) throw new Error("User not found");
  
  const id = 'addr-' + Math.random().toString(36).substring(7);
  user.addresses.push({ id, label, address });
  return user;
}

export function getOrders(phone: string): Order[] {
  return orders.filter(o => o.customer.phone === phone);
}

export function getOrderById(orderId: number): Order | null {
  return orders.find(o => o.orderId === orderId) || null;
}

export function getRestaurants(): Restaurant[] {
  return restaurants;
}

export function placeOrder(
  phone: string,
  restaurantId: string,
  cartItems: { menuItemId: number; quantity: number }[],
  paymentMethod: PaymentMethod,
  deliveryAddress: string,
  deliveryType: 'DELIVERY' | 'PICKUP',
  paymentId?: string
): Order {
  const user = users[phone];
  if (!user) throw new Error("User not found");
  
  const restaurant = restaurants.find(r => r.id === restaurantId);
  if (!restaurant) throw new Error("Restaurant not found");
  
  // SERVER-SIDE PRICE RECALCULATION & INTEGRITY CHECK
  let subtotal = 0;
  const processedItems = cartItems.map(cartItem => {
    const dbItem = restaurant.menu.find(item => item.id === cartItem.menuItemId);
    if (!dbItem) throw new Error(`Item ${cartItem.menuItemId} not found in restaurant menu`);
    if (dbItem.isAvailable === false) throw new Error(`Item "${dbItem.name}" is currently sold out!`);
    
    subtotal += dbItem.price * cartItem.quantity;
    
    return {
      menuItem: dbItem,
      quantity: cartItem.quantity
    };
  });
  
  // If order minimum is violated (e.g. Rs. 200)
  if (subtotal < 200) {
    throw new Error("Order total must be at least Rs. 200 to place an order.");
  }
  
  const deliveryCharge = deliveryType === 'PICKUP' ? 0 : (subtotal > 500 || subtotal === 0 ? 0 : restaurant.deliveryFee);
  const total = subtotal + deliveryCharge;
  
  let paymentStatus: PaymentStatus = 'PENDING';
  if (paymentMethod === 'CASH_ON_DELIVERY') {
    paymentStatus = 'PENDING';
  } else {
    // eSewa or Khalti (assumed successful if placed via frontend gateway modal)
    paymentStatus = 'SUCCESS';
  }
  
  const orderId = Math.floor(100000 + Math.random() * 900000);
  const newOrder: Order = {
    orderId,
    restaurantId,
    restaurantName: restaurant.name,
    customer: { ...user, address: deliveryAddress },
    items: processedItems,
    orderTime: new Date().toLocaleString(),
    deliveryCharge,
    subtotal,
    total,
    paymentMethod,
    paymentStatus,
    status: 'PENDING',
    paymentId: paymentId || (paymentMethod !== 'CASH_ON_DELIVERY' ? 'PAY-' + Math.random().toString(36).substring(4).toUpperCase() : undefined),
    deliveryType
  };
  
  orders.unshift(newOrder);
  return newOrder;
}

// ================= ADMIN FUNCTIONS =================

export function getAllOrders(): Order[] {
  return orders;
}

export function adminUpdateOrderStatus(orderId: number, status: OrderStatus, reason?: string): Order {
  const order = orders.find(o => o.orderId === orderId);
  if (!order) throw new Error("Order not found");
  
  order.status = status;
  if (reason) {
    order.cancellationReason = reason;
  }
  
  if (status === 'CANCELLED' && order.paymentStatus === 'SUCCESS') {
    order.paymentStatus = 'REFUNDED';
  }
  
  return order;
}

export function adminUpdateMenuItem(
  restaurantId: string,
  itemId: number,
  data: Partial<MenuItem>
): MenuItem {
  const restaurant = restaurants.find(r => r.id === restaurantId);
  if (!restaurant) throw new Error("Restaurant not found");
  
  const item = restaurant.menu.find(i => i.id === itemId);
  if (!item) throw new Error("Menu item not found");
  
  Object.assign(item, data);
  return item;
}

export function adminAddMenuItem(
  restaurantId: string,
  data: Omit<MenuItem, 'id'>
): MenuItem {
  const restaurant = restaurants.find(r => r.id === restaurantId);
  if (!restaurant) throw new Error("Restaurant not found");
  
  const nextId = Math.max(...restaurant.menu.map(i => i.id), 0) + 1;
  const newItem: MenuItem = {
    ...data,
    id: nextId,
    restaurantId,
    isAvailable: data.isAvailable !== false
  };
  
  restaurant.menu.push(newItem);
  return newItem;
}

export function adminDeleteMenuItem(
  restaurantId: string,
  itemId: number
): boolean {
  const restaurant = restaurants.find(r => r.id === restaurantId);
  if (!restaurant) throw new Error("Restaurant not found");
  
  const index = restaurant.menu.findIndex(i => i.id === itemId);
  if (index === -1) return false;
  
  restaurant.menu.splice(index, 1);
  return true;
}

export function adminGetSalesStats() {
  const todayOrders = orders;
  const activeOrders = todayOrders.filter(o => o.status !== 'CANCELLED');
  const revenue = activeOrders.reduce((sum, o) => sum + o.total, 0);
  
  // Count items
  const itemCounts: Record<string, number> = {};
  activeOrders.forEach(o => {
    o.items.forEach(it => {
      const name = it.menuItem.name;
      itemCounts[name] = (itemCounts[name] || 0) + it.quantity;
    });
  });
  
  const mostOrdered = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
    
  return {
    orderCount: todayOrders.length,
    revenue,
    mostOrdered
  };
}
