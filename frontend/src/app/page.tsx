'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Wallet,
  MapPin,
  Phone,
  User,
  Plus,
  Minus,
  Trash2,
  Search,
  Sparkles,
  Clock,
  CreditCard,
  Smartphone,
  Truck,
  CheckCircle2,
  Loader2,
  History,
  ArrowRight,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { mockMenuItems, mockCategories } from '../data/mockData';
import {
  MenuItem,
  Customer,
  WalletTransaction,
  OrderItem,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '../types/food';

interface FlyingItem {
  id: string;
  image: string;
  startX: number;
  startY: number;
}

export default function Dashboard() {
  // Customer & Registration state
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [showRegModal, setShowRegModal] = useState(true);

  // Wallet state
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([
    {
      id: 'TX-INIT',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'CREDIT',
      amount: 500,
      balanceAfter: 500,
      description: 'Welcome Bonus Credited',
    },
  ]);
  const [topUpAmount, setTopUpAmount] = useState('');

  // Cart & Order state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('WALLET');
  
  // Simulated Card Payment Fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  // Simulated UPI Fields
  const [upiId, setUpiId] = useState('');

  // Order Placement & Status simulation
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [statusTimerId, setStatusTimerId] = useState<NodeJS.Timeout | null>(null);

  // Micro-interactions / animation state
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [cartPulse, setCartPulse] = useState(false);

  // Default Auto-Register on load (optional, but let's show modal for realism)
  useEffect(() => {
    // If not registered, trigger modal
    setShowRegModal(true);
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone || !regAddress) return;
    
    setCustomer({
      name: regName,
      phone: regPhone,
      address: regAddress,
      walletBalance: 500.0,
    });
    setShowRegModal(false);
  };

  // Add Item to Cart with "Flying" animation
  const addToCart = (item: MenuItem, e: React.MouseEvent) => {
    // 1. Create flying object
    const startX = e.clientX;
    const startY = e.clientY;
    const flyingId = Math.random().toString(36).substring(7);
    
    setFlyingItems((prev) => [...prev, { id: flyingId, image: item.image, startX, startY }]);

    // Remove flying object after animation finished (750ms)
    setTimeout(() => {
      setFlyingItems((prev) => prev.filter((fi) => fi.id !== flyingId));
      // 2. Pulse cart button
      setCartPulse(true);
      setTimeout(() => setCartPulse(false), 300);
    }, 750);

    // 3. Add to cart state
    setCart((prev) => {
      const existing = prev.find((oi) => oi.menuItem.id === item.id);
      if (existing) {
        return prev.map((oi) =>
          oi.menuItem.id === item.id ? { ...oi, quantity: oi.quantity + 1 } : oi
        );
      }
      return [...prev, { menuItem: item, quantity: 1 }];
    });
  };

  const updateCartQuantity = (itemId: number, change: number) => {
    setCart((prev) =>
      prev
        .map((oi) => {
          if (oi.menuItem.id === itemId) {
            const nextQty = oi.quantity + change;
            return { ...oi, quantity: nextQty };
          }
          return oi;
        })
        .filter((oi) => oi.quantity > 0)
    );
  };

  const clearCart = () => setCart([]);

  // Wallet Add Balance
  const handleAddBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    const amt = parseFloat(topUpAmount);
    if (isNaN(amt) || amt <= 0) return;

    const newBalance = customer.walletBalance + amt;
    setCustomer({ ...customer, walletBalance: newBalance });
    
    const newTx: WalletTransaction = {
      id: 'TX-' + Math.random().toString(36).substring(4).toUpperCase(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'CREDIT',
      amount: amt,
      balanceAfter: newBalance,
      description: 'Loaded Cash via Digital Bank',
    };
    setWalletTransactions([newTx, ...walletTransactions]);
    setTopUpAmount('');
  };

  // Math Calculations (matching Java logic)
  const subtotal = cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const deliveryCharge = subtotal > 500 || subtotal === 0 ? 0 : 50;
  const total = subtotal + deliveryCharge;

  // Checkout process simulation
  const handleCheckout = async () => {
    if (!customer || cart.length === 0) return;

    // Clear previous simulation timeline if running
    if (statusTimerId) {
      clearInterval(statusTimerId);
      setStatusTimerId(null);
    }

    setCheckoutLoading(true);

    // Simulate Network/Processing latency (like Thread.sleep in Java)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    let paymentSuccess = false;
    let paymentId = 'PAY' + Date.now();
    let balanceAfter = customer.walletBalance;

    if (paymentMethod === 'WALLET') {
      if (customer.walletBalance >= total) {
        balanceAfter = customer.walletBalance - total;
        setCustomer({ ...customer, walletBalance: balanceAfter });
        
        const newTx: WalletTransaction = {
          id: 'TX-' + Math.random().toString(36).substring(4).toUpperCase(),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'DEBIT',
          amount: total,
          balanceAfter: balanceAfter,
          description: `Order Payment (${paymentId})`,
        };
        setWalletTransactions([newTx, ...walletTransactions]);
        paymentSuccess = true;
      } else {
        alert(`❌ Payment failed! Insufficient wallet balance.\nRequired: Rs. ${total} | Balance: Rs. ${customer.walletBalance}`);
      }
    } else if (paymentMethod === 'CARD') {
      // Simulate 95% success rate (matching Java)
      if (Math.random() < 0.95) {
        paymentSuccess = true;
      } else {
        alert('❌ Card payment failed! Please try again.');
      }
    } else if (paymentMethod === 'UPI') {
      // Simulate 90% success rate (matching Java)
      if (Math.random() < 0.90) {
        paymentSuccess = true;
      } else {
        alert('❌ UPI transaction failed! Please verify UPI PIN and retry.');
      }
    } else if (paymentMethod === 'CASH_ON_DELIVERY') {
      paymentSuccess = true;
    }

    setCheckoutLoading(false);

    if (paymentSuccess) {
      const newOrder: Order = {
        orderId: Math.floor(1000 + Math.random() * 9000),
        customer: { ...customer, walletBalance: balanceAfter },
        items: [...cart],
        orderTime: new Date().toLocaleString(),
        deliveryCharge,
        subtotal,
        total,
        paymentMethod,
        paymentStatus: 'SUCCESS',
        status: 'PENDING',
        paymentId,
      };

      setActiveOrder(newOrder);
      clearCart();

      // Start status transition simulation automatically (timeline advancement)
      simulateOrderStatusTransition(newOrder.orderId);
    }
  };

  // Simulates backend progression of Order Status
  const simulateOrderStatusTransition = (orderId: number) => {
    const statuses: OrderStatus[] = [
      'CONFIRMED',
      'PREPARING',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];
    let currentIndex = 0;

    const timer = setInterval(() => {
      setActiveOrder((prev) => {
        if (!prev || prev.orderId !== orderId) {
          clearInterval(timer);
          return prev;
        }

        const nextStatus = statuses[currentIndex];
        currentIndex++;

        if (currentIndex >= statuses.length) {
          clearInterval(timer);
        }

        return {
          ...prev,
          status: nextStatus,
        };
      });
    }, 6000); // Transitions every 6 seconds for interactive visibility

    setStatusTimerId(timer);
  };

  // Cleanup timers
  useEffect(() => {
    return () => {
      if (statusTimerId) clearInterval(statusTimerId);
    };
  }, [statusTimerId]);

  // Filter and Search items
  const filteredItems = mockMenuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen relative p-4 md:p-8 flex flex-col items-center justify-start bg-slate-50/70">
      {/* Ambient background glows */}
      <div className="glow-blob bg-amber-200/50 w-[40vw] h-[40vw] -top-10 -left-10" />
      <div className="glow-blob bg-orange-300/40 w-[45vw] h-[45vw] top-[40vh] right-10" />
      <div className="glow-blob bg-amber-100/60 w-[35vw] h-[35vw] bottom-10 left-[20vw]" />

      {/* Scaffold container */}
      <div className="w-full max-w-7xl relative z-10 flex flex-col gap-6">
        
        {/* TOP BAR / NAVIGATION */}
        <header className="glass-panel rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20 text-white font-bold text-xl">
              TB
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-700 bg-clip-text text-transparent">
                Tasty Bites
              </h1>
              <p className="text-xs text-stone-500">Premium Food Ordering & Real-Time Logistics</p>
            </div>
          </div>

          {/* User profile / Register status */}
          <div className="flex items-center gap-4">
            {customer ? (
              <div className="flex items-center gap-3 pl-4 border-l border-stone-200">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-stone-800">{customer.name}</p>
                  <p className="text-xs text-stone-500 flex items-center justify-end gap-1">
                    <MapPin className="w-3 h-3 text-orange-500" /> {customer.address}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <button
                  onClick={() => setShowRegModal(true)}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium underline"
                >
                  Edit details
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowRegModal(true)}
                className="magnetic-btn px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-medium rounded-2xl text-sm shadow-md"
              >
                Register Customer
              </button>
            )}
          </div>
        </header>

        {/* BENTO GRID LAYOUT */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT SIDEBAR: MENU & SEARCH & CATEGORIES (Col span 8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* SEARCH & FILTERS BENTO */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search momo, burger, drinks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-2xl glass-input text-stone-800 text-sm focus:outline-none"
                />
              </div>

              {/* Category tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 max-w-full no-scrollbar">
                {mockCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/10'
                        : 'bg-white/50 text-stone-600 hover:bg-white border border-stone-200/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* FOOD ITEMS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel glass-panel-hover rounded-3xl overflow-hidden flex flex-col h-[380px]"
                >
                  <div className="relative h-48 overflow-hidden group">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                    
                    {/* Tags */}
                    {item.isPopular && (
                      <span className="absolute top-3 left-3 bg-amber-500/90 text-white text-[10px] font-black tracking-wider uppercase px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm">
                        <Sparkles className="w-2.5 h-2.5" /> Popular
                      </span>
                    )}

                    <span className="absolute bottom-3 right-3 bg-white/95 text-stone-800 text-xs font-black px-2.5 py-1 rounded-xl shadow-sm backdrop-blur-sm">
                      Rs. {item.price}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <h3 className="font-bold text-stone-800 text-base">{item.name}</h3>
                        <span className="text-[10px] text-stone-500 bg-stone-200/50 px-2 py-0.5 rounded-md font-medium">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-stone-100 pt-3">
                      <span className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-orange-500" /> {item.prepTime}
                      </span>

                      <button
                        onClick={(e) => addToCart(item, e)}
                        className="magnetic-btn px-3.5 py-2 bg-stone-900 hover:bg-orange-600 text-white hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="col-span-full glass-panel rounded-3xl p-12 text-center">
                  <p className="text-stone-500 text-sm">No items found matching your filters.</p>
                </div>
              )}
            </div>

            {/* BENTO ROW: WALLET CARD & ORDER STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* BENTO CELL 1: MANAGE WALLET */}
              <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between h-[320px]">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-stone-500 tracking-wider uppercase block mb-1">
                      Wallet System
                    </span>
                    <h2 className="text-2xl font-black text-stone-800">My Balance</h2>
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-orange-100/80 flex items-center justify-center text-orange-600 shadow-sm border border-orange-200/30">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>

                <div className="my-4">
                  <p className="text-3xl font-extrabold text-orange-600">
                    Rs. {customer ? customer.walletBalance.toFixed(2) : '500.00'}
                  </p>
                  <p className="text-xs text-stone-400 mt-1">Includes initial Rs. 500 welcome bonus</p>
                </div>

                {/* Add Balance form */}
                <form onSubmit={handleAddBalance} className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Load Amount"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 text-sm rounded-xl glass-input text-stone-800 focus:outline-none"
                    min="1"
                  />
                  <button
                    type="submit"
                    className="magnetic-btn px-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/10 flex items-center justify-center"
                  >
                    Add Money
                  </button>
                </form>
              </div>

              {/* BENTO CELL 2: TRANSACTION HISTORY */}
              <div className="glass-panel rounded-3xl p-6 flex flex-col h-[320px]">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-orange-500" />
                    <h3 className="font-bold text-stone-800 text-sm uppercase tracking-wide">
                      Transaction Logs
                    </h3>
                  </div>
                  <span className="text-[10px] bg-stone-200/60 text-stone-600 px-2 py-0.5 rounded-md font-bold">
                    Wallet Payments
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                  {walletTransactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-3 bg-white/40 rounded-2xl border border-stone-200/20 flex items-center justify-between text-xs transition-colors hover:bg-white/60"
                    >
                      <div>
                        <p className="font-semibold text-stone-800">{tx.description}</p>
                        <p className="text-[10px] text-stone-400">{tx.timestamp} | {tx.id}</p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-black ${
                            tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-500'
                          }`}
                        >
                          {tx.type === 'CREDIT' ? '+' : '-'} Rs. {tx.amount}
                        </p>
                        <p className="text-[10px] text-stone-500">Bal: Rs. {tx.balanceAfter}</p>
                      </div>
                    </div>
                  ))}
                  {walletTransactions.length === 0 && (
                    <p className="text-stone-400 text-xs text-center py-8">No transactions yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR: CART, CHECKOUT, & ORDER TIMELINE (Col span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* CART SIDEBAR BENTO */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col max-h-[500px]">
              <div className="flex items-center justify-between border-b border-stone-200/40 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className={`relative ${
                      cartPulse ? 'scale-110' : ''
                    } transition-transform duration-300`}
                  >
                    <ShoppingBag className="w-5 h-5 text-orange-600" />
                    {cart.length > 0 && (
                      <span className="absolute -top-2 -right-2.5 bg-orange-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)}
                      </span>
                    )}
                  </div>
                  <h3 className="font-extrabold text-stone-800 text-base">Checkout Basket</h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-stone-400 hover:text-red-500 font-bold transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Cart item list */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-[150px] max-h-[220px]">
                {cart.map((item) => (
                  <div
                    key={item.menuItem.id}
                    className="flex items-center gap-3 bg-white/40 p-2.5 rounded-2xl border border-stone-200/20"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <img
                        src={item.menuItem.image}
                        alt={item.menuItem.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-800 truncate">
                        {item.menuItem.name}
                      </h4>
                      <p className="text-[10px] text-stone-500">
                        Rs. {item.menuItem.price} &times; {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateCartQuantity(item.menuItem.id, -1)}
                        className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-stone-800 w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.menuItem.id, 1)}
                        className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center py-8 text-stone-400">
                    <ShoppingBag className="w-10 h-10 text-stone-200 stroke-[1.5] mb-2" />
                    <p className="text-xs">Your basket is empty</p>
                    <p className="text-[10px] mt-0.5">Add items from the menu explorer</p>
                  </div>
                )}
              </div>

              {/* Price calculations & delivery banner */}
              {cart.length > 0 && (
                <div className="border-t border-stone-200/40 mt-4 pt-4 flex flex-col gap-2">
                  
                  {/* Delivery banner */}
                  <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-2.5 flex items-center justify-between text-[10px] mb-1">
                    <span className="font-semibold text-stone-700 flex items-center gap-1">
                      <Truck className="w-3 h-3 text-orange-500" /> Free delivery threshold
                    </span>
                    <span className="font-black text-orange-600">Rs. 500</span>
                  </div>

                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-stone-800">Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Delivery Charge</span>
                    <span className="font-bold text-stone-800">
                      {deliveryCharge === 0 ? (
                        <span className="text-green-600 font-extrabold text-[10px] tracking-wide uppercase">
                          FREE
                        </span>
                      ) : (
                        `Rs. ${deliveryCharge.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-stone-800 font-black border-t border-stone-100 pt-2 mt-1">
                    <span>Grand Total</span>
                    <span className="text-orange-600 text-base">Rs. {total.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* PAYMENT DETAILS FORM & BUTTON */}
            {cart.length > 0 && (
              <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4">
                <h4 className="text-xs font-black uppercase text-stone-500 tracking-wider">
                  Select Payment System
                </h4>

                {/* Tabs */}
                <div className="grid grid-cols-2 gap-2">
                  {(['WALLET', 'CARD', 'UPI', 'CASH_ON_DELIVERY'] as PaymentMethod[]).map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={`py-2 px-1 text-[10px] font-black rounded-xl border text-center transition-all ${
                        paymentMethod === method
                          ? 'border-orange-500 bg-orange-50/50 text-orange-600 shadow-sm'
                          : 'border-stone-200/40 bg-white/40 text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      {method.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>

                {/* Input Fields corresponding to payment choice */}
                {paymentMethod === 'CARD' && (
                  <div className="flex flex-col gap-2 bg-white/30 p-3 rounded-2xl border border-stone-200/10">
                    <input
                      type="text"
                      placeholder="Card Number (16 Digits)"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      maxLength={16}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Card Holder Name"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
                    />
                  </div>
                )}

                {paymentMethod === 'UPI' && (
                  <div className="flex flex-col gap-2 bg-white/30 p-3 rounded-2xl border border-stone-200/10">
                    <input
                      type="text"
                      placeholder="Enter UPI ID (e.g. name@pay)"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl glass-input focus:outline-none"
                    />
                  </div>
                )}

                {paymentMethod === 'WALLET' && (
                  <div className="bg-white/30 p-3 rounded-2xl border border-stone-200/10 text-center text-xs text-stone-600">
                    Deducted from balance: <strong className="text-orange-600">Rs. {total.toFixed(2)}</strong>
                    <br />
                    Available Wallet Balance:{' '}
                    <strong className="text-stone-800">
                      Rs. {customer ? customer.walletBalance.toFixed(2) : '500.00'}
                    </strong>
                  </div>
                )}

                {paymentMethod === 'CASH_ON_DELIVERY' && (
                  <div className="bg-white/30 p-3 rounded-2xl border border-stone-200/10 text-center text-xs text-stone-600 flex items-center justify-center gap-1">
                    <span>💰 Please keep</span>
                    <strong className="text-orange-600">Rs. {total.toFixed(2)}</strong>
                    <span>ready for delivery.</span>
                  </div>
                )}

                {/* Checkout trigger */}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || !customer}
                  className={`w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-orange-500/10 magnetic-btn ${
                    checkoutLoading || !customer ? 'opacity-65 cursor-not-allowed' : ''
                  }`}
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing Payment...
                    </>
                  ) : !customer ? (
                    'Register Details First'
                  ) : (
                    <>
                      Place Order &amp; Pay <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ORDER STATUS TRACKER BENTO */}
            <div className="glass-panel rounded-3xl p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-stone-200/40 pb-3">
                <h3 className="font-extrabold text-stone-800 text-sm uppercase tracking-wide">
                  Order Status Tracker
                </h3>
                {activeOrder && (
                  <span className="text-[9px] font-black text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                    ID: #{activeOrder.orderId}
                  </span>
                )}
              </div>

              {activeOrder ? (
                <div className="flex flex-col gap-5 py-2">
                  {/* Status Steps */}
                  {([
                    { label: 'PENDING', desc: 'Order received, pending payment validation' },
                    { label: 'CONFIRMED', desc: 'Payment approved, restaurant accepted order' },
                    { label: 'PREPARING', desc: 'Chef is baking/cooking your meal' },
                    { label: 'OUT_FOR_DELIVERY', desc: 'Rider picked up food and is heading to you' },
                    { label: 'DELIVERED', desc: 'Enjoy your warm Nepalese meal! 🍽️' },
                  ] as { label: OrderStatus; desc: string }[]).map((step, idx, arr) => {
                    const statusesOrdered: OrderStatus[] = [
                      'PENDING',
                      'CONFIRMED',
                      'PREPARING',
                      'OUT_FOR_DELIVERY',
                      'DELIVERED',
                    ];
                    const activeIndex = statusesOrdered.indexOf(activeOrder.status);
                    const currentStepIndex = statusesOrdered.indexOf(step.label);
                    const isCompleted = currentStepIndex <= activeIndex;
                    const isActive = step.label === activeOrder.status;

                    return (
                      <div key={step.label} className="relative flex gap-3.5 items-start">
                        {/* Line connector */}
                        {idx !== arr.length - 1 && (
                          <div
                            className={`absolute left-2.5 top-6 w-0.5 h-12 -translate-x-1/2 transition-colors duration-500 ${
                              currentStepIndex < activeIndex ? 'bg-orange-500' : 'bg-stone-200'
                            }`}
                          />
                        )}
                        
                        {/* Circle Indicator */}
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 border z-10 ${
                            isActive
                              ? 'bg-orange-500 text-white border-orange-600 ring-4 ring-orange-100 scale-110'
                              : isCompleted
                              ? 'bg-orange-500/90 text-white border-orange-500'
                              : 'bg-white text-stone-300 border-stone-200'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-3 h-3 stroke-[3]" />
                          ) : (
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                          )}
                        </div>

                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-xs font-black transition-colors ${
                              isActive
                                ? 'text-orange-600 font-black'
                                : isCompleted
                                ? 'text-stone-800 font-bold'
                                : 'text-stone-400 font-medium'
                            }`}
                          >
                            {step.label.replace(/_/g, ' ')}
                          </p>
                          <p className="text-[10px] text-stone-500 line-clamp-1 mt-0.5">
                            {step.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                  {/* Simulated Receipt details link */}
                  <div className="mt-3 bg-stone-50 p-3 rounded-2xl border border-stone-200/50 flex flex-col gap-1 text-[10px] text-stone-600">
                    <div className="flex justify-between">
                      <span>Order Time:</span>
                      <strong className="text-stone-800">{activeOrder.orderTime}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Charge:</span>
                      <strong className="text-stone-800">
                        {activeOrder.deliveryCharge === 0 ? 'FREE' : `Rs. ${activeOrder.deliveryCharge}`}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Grand Total paid:</span>
                      <strong className="text-orange-600">Rs. {activeOrder.total}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Payment Reference:</span>
                      <strong className="text-stone-500 truncate max-w-[120px]">{activeOrder.paymentId}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-stone-400 text-center">
                  <Truck className="w-10 h-10 text-stone-200 stroke-[1.5] mb-2" />
                  <p className="text-xs">No active order to track</p>
                  <p className="text-[10px] mt-0.5 max-w-[200px]">
                    Place an order using your cart to launch real-time progress simulation
                  </p>
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* REGISTRATION MODAL */}
      {showRegModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-[32px] p-8 shadow-2xl relative">
            <h2 className="text-2xl font-black text-stone-800 mb-2 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-500" /> Welcome to Tasty Bites
            </h2>
            <p className="text-xs text-stone-500 mb-6 leading-relaxed">
              Register your details to order food online. Upon register, we will load{' '}
              <strong className="text-orange-600">Rs. 500</strong> to your virtual wallet as a welcome bonus!
            </p>

            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prasanna Neupane"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-sm text-stone-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9812345678"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-sm text-stone-800 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase text-stone-500 tracking-wider">
                  Delivery Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kathmandu, Nepal"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl glass-input text-sm text-stone-800 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold rounded-2xl text-xs shadow-md shadow-orange-500/20 magnetic-btn flex items-center justify-center gap-1.5"
              >
                Register &amp; Claim Rs. 500 <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* FLYING CART ANIMATION CONTAINER */}
      {flyingItems.map((fi) => (
        <div
          key={fi.id}
          className="animate-fly w-14 h-14 rounded-full border-2 border-orange-500 overflow-hidden shadow-lg"
          style={{
            left: fi.startX - 28,
            top: fi.startY - 28,
            '--x-dest': `${window.innerWidth - 300 - fi.startX}px`,
            '--y-dest': `${150 - fi.startY}px`,
            '--x-mid': `${(window.innerWidth - 300 - fi.startX) / 2 - 100}px`,
            '--y-mid': `${(150 - fi.startY) / 2 - 120}px`,
          } as React.CSSProperties}
        >
          <img src={fi.image} alt="flying" className="w-full h-full object-cover" />
        </div>
      ))}
    </div>
  );
}
