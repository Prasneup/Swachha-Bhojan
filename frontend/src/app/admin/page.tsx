'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  TrendingUp,
  Plus,
  Trash2,
  LogOut,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Truck,
  Utensils,
  Lock,
  ArrowLeft,
  Building,
  DollarSign
} from 'lucide-react';
import { Restaurant, Order, MenuItem, OrderStatus } from '../../types/food';

export default function AdminDashboard() {
  // Access Control / Auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Dashboard state
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'menu' | 'stats'>('orders');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestId, setSelectedRestId] = useState('');
  
  // Orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderFilter, setOrderFilter] = useState<string>('ALL');
  const [cancelReasons, setCancelReasons] = useState<Record<number, string>>({});
  const [showCancelInput, setShowCancelInput] = useState<Record<number, boolean>>({});

  // Menu Form Modal
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState({
    name: '',
    price: 0,
    category: 'Appetizers',
    image: '',
    description: '',
    isPopular: false,
    prepTime: '15-20 min'
  });

  // Sales Stats
  const [stats, setStats] = useState({
    orderCount: 0,
    revenue: 0,
    mostOrdered: [] as { name: string; count: number }[]
  });

  // Declare API helpers BEFORE they are referenced in hooks
  const fetchAdminData = useCallback(async () => {
    try {
      const ordersRes = await fetch('/api/admin/orders', {
        headers: { 'Authorization': 'admin' }
      });
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData);
      }

      const statsRes = await fetch('/api/admin/stats', {
        headers: { 'Authorization': 'admin' }
      });
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const loadMenuRestaurants = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': 'admin' }
      });
      if (res.ok) {
        const statsData = await res.json();
        if (statsData.restaurants) {
          setRestaurants(statsData.restaurants);
          if (statsData.restaurants.length > 0 && !selectedRestId) {
            setSelectedRestId(statsData.restaurants[0].id);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [selectedRestId]);

  // Auth checking
  useEffect(() => {
    const adminSession = localStorage.getItem('tasty_bites_admin_session');
    if (adminSession === 'active') {
      setTimeout(() => {
        setIsAuthenticated(true);
      }, 0);
    }
  }, []);

  // Sync / Polling
  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => {
        fetchAdminData();
        loadMenuRestaurants();
      }, 0);
    }
    const interval = setInterval(() => {
      if (isAuthenticated) {
        fetchAdminData();
      }
    }, 7000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchAdminData, loadMenuRestaurants]);

  // Sync menu list on tab changes
  useEffect(() => {
    if (isAuthenticated) {
      setTimeout(() => {
        loadMenuRestaurants();
      }, 0);
    }
  }, [isAuthenticated, activeSubTab, loadMenuRestaurants]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin' || password === 'tastybites123') {
      localStorage.setItem('tasty_bites_admin_session', 'active');
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('❌ Incorrect admin password. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tasty_bites_admin_session');
    setIsAuthenticated(false);
    setPassword('');
  };

  // Update order status
  const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
    const reason = cancelReasons[orderId] || '';
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin'
        },
        body: JSON.stringify({ status, reason })
      });
      if (res.ok) {
        fetchAdminData();
        setCancelReasons(prev => ({ ...prev, [orderId]: '' }));
        setShowCancelInput(prev => ({ ...prev, [orderId]: false }));
      } else {
        const errData = await res.json();
        alert(`❌ Failed to update status: ${errData.error}`);
      }
    } catch (err) {
      alert("❌ Server communication issue.");
    }
  };

  // Menu modification
  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestId) return;

    const isEdit = !!editingItem;
    const payload = {
      action: isEdit ? 'EDIT' : 'ADD',
      restaurantId: selectedRestId,
      itemId: editingItem?.id,
      data: menuForm
    };

    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowMenuModal(false);
        setEditingItem(null);
        setMenuForm({
          name: '',
          price: 0,
          category: 'Appetizers',
          image: '',
          description: '',
          isPopular: false,
          prepTime: '15-20 min'
        });
        
        // Sync restaurants menu
        loadMenuRestaurants();
      } else {
        const errData = await res.json();
        alert(`❌ Failed to save item: ${errData.error}`);
      }
    } catch (err) {
      alert("❌ Server communication error.");
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    if (!selectedRestId) return;
    const payload = {
      action: 'EDIT',
      restaurantId: selectedRestId,
      itemId: item.id,
      data: { isAvailable: !item.isAvailable }
    };
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        loadMenuRestaurants();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!selectedRestId) return;
    if (!confirm("Are you sure you want to delete this menu item?")) return;

    const payload = {
      action: 'DELETE',
      restaurantId: selectedRestId,
      itemId
    };
    try {
      const res = await fetch('/api/admin/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'admin'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        loadMenuRestaurants();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered orders list
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'ALL') return true;
    return o.status === orderFilter;
  });

  const selectedRest = restaurants.find(r => r.id === selectedRestId);

  // Authentication Gate Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 font-sans selection:bg-amber-500 selection:text-black">
        <div className="absolute top-6 left-6">
          <Link href="/" className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-amber-500 font-bold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Storefront
          </Link>
        </div>
        <div className="w-full max-w-md bg-stone-900/60 border border-stone-850 p-8 rounded-[32px] shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center gap-2 mb-6">
            <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex items-center justify-center text-amber-500 mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black serif-title tracking-tight">Staff Administration</h1>
            <p className="text-stone-400 text-xs text-center font-medium">
              Access the live orders controller and menu database manager.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-amber-500 tracking-wider mb-1.5">
                Staff Passcode
              </label>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-850 text-stone-400 text-xs font-semibold focus:outline-none focus:border-amber-500 transition-colors"
                required
              />
            </div>
            {authError && <p className="text-red-400 text-[11px] font-semibold">{authError}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-xl text-xs font-black tracking-wider uppercase shadow-lg shadow-amber-500/10 transition-colors cursor-pointer mt-2"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-amber-500 selection:text-black">
      {/* HEADER SECTION */}
      <header className="border-b border-stone-900 bg-stone-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="bg-amber-500/15 border border-amber-500/30 text-amber-500 text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase">
              Staff Portal
            </span>
            <h1 className="text-lg font-black tracking-tight serif-title text-stone-100">Tasty Bites Manager</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-stone-400 hover:text-stone-200 font-semibold transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Client View
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-stone-400 hover:text-red-400 font-semibold transition-colors flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* DASHBOARD LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-6">
        {/* SUB NAVIGATION TABS */}
        <div className="flex gap-2 bg-stone-900/50 border border-stone-850 p-1 rounded-2xl self-start">
          <button
            onClick={() => setActiveSubTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-2 ${
              activeSubTab === 'orders'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10'
                : 'text-stone-400 hover:text-amber-500'
            }`}
          >
            <ClipboardList className="w-4 h-4" /> Live Orders ({orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length})
          </button>
          <button
            onClick={() => setActiveSubTab('menu')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-2 ${
              activeSubTab === 'menu'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10'
                : 'text-stone-400 hover:text-amber-500'
            }`}
          >
            <Utensils className="w-4 h-4" /> Menu Editor
          </button>
          <button
            onClick={() => setActiveSubTab('stats')}
            className={`px-5 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all flex items-center gap-2 ${
              activeSubTab === 'stats'
                ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10'
                : 'text-stone-400 hover:text-amber-500'
            }`}
          >
            <TrendingUp className="w-4 h-4" /> Daily Sales
          </button>
        </div>

        {/* 1. ORDERS SECTION */}
        {activeSubTab === 'orders' && (
          <div className="flex flex-col gap-6">
            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].map((f) => (
                <button
                  key={f}
                  onClick={() => setOrderFilter(f)}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all ${
                    orderFilter === f
                      ? 'bg-amber-500/15 border border-amber-500 text-amber-500'
                      : 'bg-stone-900 border border-stone-850 text-stone-400 hover:border-stone-750'
                  }`}
                >
                  {f.replace(/_/g, ' ')} ({f === 'ALL' ? orders.length : orders.filter(o => o.status === f).length})
                </button>
              ))}
            </div>

            {/* Orders Feed */}
            <div className="flex flex-col gap-4">
              {filteredOrders.map((order) => (
                <div key={order.orderId} className="bg-stone-900/40 border border-stone-850 p-6 rounded-[28px] flex flex-col md:flex-row justify-between gap-6 shadow-md">
                  <div className="flex-1 flex flex-col gap-3 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-black text-amber-500">#{order.orderId}</span>
                      <span className="text-[10px] text-stone-400 font-semibold">{order.orderTime}</span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {order.deliveryType}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300">
                        {order.paymentMethod.replace(/_/g, ' ')} - {order.paymentStatus}
                      </span>
                    </div>

                    <div className="border-t border-stone-850 pt-2">
                      <h4 className="text-[10px] uppercase font-black tracking-wider text-amber-500/80 mb-1">Customer Details</h4>
                      <p className="text-xs font-black text-stone-200">{order.customer.name} ({order.customer.phone})</p>
                      {order.deliveryType === 'DELIVERY' && (
                        <p className="text-xs text-stone-400 mt-0.5 truncate">📍 {order.customer.address}</p>
                      )}
                    </div>

                    <div className="border-t border-stone-850 pt-2">
                      <h4 className="text-[10px] uppercase font-black tracking-wider text-amber-500/80 mb-1.5">Items Ordered</h4>
                      <div className="flex flex-col gap-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-stone-300">
                              {item.menuItem.name} <strong className="text-stone-500 font-semibold">x{item.quantity}</strong>
                            </span>
                            <span className="text-stone-400 font-semibold">Rs. {item.menuItem.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between items-end gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-stone-500 block">Total Revenue</span>
                      <strong className="text-lg font-black text-amber-500">Rs. {order.total}</strong>
                    </div>

                    {/* Status progression actions */}
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      {order.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(order.orderId, 'CONFIRMED')}
                            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Accept Order
                          </button>
                          
                          {!showCancelInput[order.orderId] ? (
                            <button
                              onClick={() => setShowCancelInput(prev => ({ ...prev, [order.orderId]: true }))}
                              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/25 border border-red-500/20 text-red-400 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Cancel Order
                            </button>
                          ) : (
                            <div className="flex flex-col gap-2 mt-1 w-48">
                              <input
                                type="text"
                                placeholder="Reason (e.g. Sold Out)"
                                value={cancelReasons[order.orderId] || ''}
                                onChange={(e) => setCancelReasons(prev => ({ ...prev, [order.orderId]: e.target.value }))}
                                className="px-2.5 py-1.5 rounded-lg bg-stone-950 border border-stone-850 text-[11px] text-stone-400 focus:outline-none"
                              />
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleUpdateStatus(order.orderId, 'CANCELLED')}
                                  className="flex-1 py-1 bg-red-500 text-black font-black text-[9px] uppercase tracking-widest rounded cursor-pointer"
                                >
                                  Submit
                                </button>
                                <button
                                  onClick={() => setShowCancelInput(prev => ({ ...prev, [order.orderId]: false }))}
                                  className="px-2 py-1 bg-stone-800 text-stone-300 font-bold text-[9px] uppercase rounded cursor-pointer"
                                >
                                  Back
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {order.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.orderId, 'PREPARING')}
                          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Utensils className="w-3.5 h-3.5" /> Start Preparing
                        </button>
                      )}

                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.orderId, 'OUT_FOR_DELIVERY')}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-black font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" /> Out for Delivery
                        </button>
                      )}

                      {order.status === 'OUT_FOR_DELIVERY' && (
                        <button
                          onClick={() => handleUpdateStatus(order.orderId, 'DELIVERED')}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-black text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Complete / Delivered
                        </button>
                      )}

                      {order.status === 'DELIVERED' && (
                        <span className="text-xs text-green-500 font-black flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Delivered & Settled
                        </span>
                      )}

                      {order.status === 'CANCELLED' && (
                        <div className="text-right">
                          <span className="text-xs text-red-400 font-black flex items-center gap-1 justify-end">
                            <XCircle className="w-4 h-4" /> Cancelled
                          </span>
                          {order.cancellationReason && (
                            <p className="text-[10px] text-stone-500 mt-0.5">Reason: {order.cancellationReason}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredOrders.length === 0 && (
                <div className="bg-stone-900 border border-stone-850 rounded-[28px] p-12 text-center">
                  <p className="text-stone-500 text-xs font-semibold">No orders found in this status category.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. MENU EDITOR SECTION */}
        {activeSubTab === 'menu' && (
          <div className="flex flex-col gap-6">
            {/* Rest selection tabs */}
            <div className="flex justify-between items-center gap-4 flex-wrap border-b border-stone-850 pb-4">
              <div className="flex gap-2">
                {restaurants.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedRestId(r.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedRestId === r.id
                        ? 'bg-amber-500/10 border-amber-500 text-amber-500'
                        : 'bg-stone-900 border-stone-850 text-stone-400 hover:border-stone-800'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setEditingItem(null);
                  setMenuForm({
                    name: '',
                    price: 0,
                    category: 'Appetizers',
                    image: '',
                    description: '',
                    isPopular: false,
                    prepTime: '15-20 min'
                  });
                  setShowMenuModal(true);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Menu Item
              </button>
            </div>

            {/* Menu List Table */}
            {selectedRest && (
              <div className="bg-stone-900 border border-stone-850 rounded-[32px] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-stone-850 text-[10px] font-black text-stone-400 uppercase tracking-wider bg-stone-950">
                        <th className="px-6 py-4">Dish Details</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Preparation</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-850 text-xs">
                      {selectedRest.menu.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-950">
                          <td className="px-6 py-4 flex items-center gap-3.5">
                            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-stone-850">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <strong className="block text-stone-450 font-extrabold">{item.name}</strong>
                              <span className="text-[10px] text-stone-500 block max-w-xs truncate">{item.description}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-950 border border-stone-850 text-stone-400">
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-extrabold text-amber-500">Rs. {item.price}</td>
                          <td className="px-6 py-4 text-stone-600 font-semibold">{item.prepTime}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleToggleAvailability(item)}
                              className={`px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase cursor-pointer transition-colors ${
                                item.isAvailable !== false
                                  ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
                              }`}
                            >
                              {item.isAvailable !== false ? 'In Stock' : 'Sold Out'}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setMenuForm({
                                    name: item.name,
                                    price: item.price,
                                    category: item.category,
                                    image: item.image,
                                    description: item.description,
                                    isPopular: !!item.isPopular,
                                    prepTime: item.prepTime
                                  });
                                  setShowMenuModal(true);
                                }}
                                className="p-1.5 text-stone-400 hover:text-amber-500 rounded hover:bg-stone-850 transition-colors"
                                title="Edit Item"
                              >
                                <Lock className="w-4 h-4 rotate-90" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1.5 text-stone-400 hover:text-red-400 rounded hover:bg-stone-850 transition-colors"
                                title="Delete Item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. SALES ANALYTICS SECTION */}
        {activeSubTab === 'stats' && (
          <div className="flex flex-col gap-6">
            {/* Mini KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-[28px] shadow flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-0.5">Today&apos;s Revenue</span>
                  <strong className="text-2xl font-black text-green-500">Rs. {stats.revenue}</strong>
                </div>
                <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/25 flex items-center justify-center text-green-500">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-[28px] shadow flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-0.5">Orders Processed</span>
                  <strong className="text-2xl font-black text-amber-500">{stats.orderCount}</strong>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
                  <ShoppingBag className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-[28px] shadow flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block mb-0.5">Average Order Value</span>
                  <strong className="text-2xl font-black text-stone-100">
                    Rs. {stats.orderCount > 0 ? Math.round(stats.revenue / stats.orderCount) : 0}
                  </strong>
                </div>
                <div className="w-10 h-10 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400">
                  <Building className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Most Ordered Items Panel */}
            <div className="bg-stone-900/40 border border-stone-850 p-6 rounded-[28px] shadow max-w-xl">
              <h3 className="text-sm font-black uppercase text-amber-500 tracking-wider mb-4 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Top Selling Dishes
              </h3>
              <div className="flex flex-col gap-3">
                {stats.mostOrdered.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3.5 bg-stone-950 border border-stone-850 p-3 rounded-2xl">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black text-xs flex items-center justify-center">
                      #{idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <strong className="text-xs font-black text-stone-200 block truncate">{item.name}</strong>
                      <span className="text-[10px] text-stone-500 font-semibold">{item.count} servings ordered</span>
                    </div>
                  </div>
                ))}
                {stats.mostOrdered.length === 0 && (
                  <p className="text-stone-500 text-xs text-center py-4">No order metrics logged yet today.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MENU ITEM EDIT MODAL */}
      {showMenuModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-stone-900 border border-stone-850 p-8 rounded-[32px] w-full max-w-lg shadow-2xl relative">
            <h2 className="text-xl font-black serif-title text-stone-400 tracking-tight mb-4 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-amber-500" /> {editingItem ? 'Edit Menu Dish' : 'Add New Menu Dish'}
            </h2>
            <p className="text-stone-600 text-xs mb-6">
              Publish adjustments or launch new dishes in the restaurant kitchen catalog.
            </p>

            <form onSubmit={handleMenuSubmit} className="flex flex-col gap-4 text-xs font-semibold">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-amber-500 mb-1 font-black">Dish Name</label>
                  <input
                    type="text"
                    required
                    value={menuForm.name}
                    onChange={(e) => setMenuForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-850 text-stone-400 text-xs focus:outline-none focus:border-amber-500"
                    placeholder="Chicken Momo"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-amber-500 mb-1 font-black">Category</label>
                  <select
                    value={menuForm.category}
                    onChange={(e) => setMenuForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-850 text-stone-400 text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Appetizers">Appetizers</option>
                    <option value="Main Course">Main Course</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-amber-500 mb-1 font-black">Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    min="10"
                    value={menuForm.price}
                    onChange={(e) => setMenuForm(prev => ({ ...prev, price: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-850 text-stone-400 text-xs focus:outline-none focus:border-amber-500"
                    placeholder="150"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-amber-500 mb-1 font-black">Prep Time</label>
                  <input
                    type="text"
                    required
                    value={menuForm.prepTime}
                    onChange={(e) => setMenuForm(prev => ({ ...prev, prepTime: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-850 text-stone-400 text-xs focus:outline-none focus:border-amber-500"
                    placeholder="15-20 min"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-amber-500 mb-1 font-black">Image URL</label>
                <input
                  type="text"
                  required
                  value={menuForm.image}
                  onChange={(e) => setMenuForm(prev => ({ ...prev, image: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-850 text-stone-400 text-xs focus:outline-none focus:border-amber-500"
                  placeholder="https://unsplash.com/..."
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-amber-500 mb-1 font-black">Description</label>
                <textarea
                  value={menuForm.description}
                  onChange={(e) => setMenuForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-850 text-stone-400 text-xs focus:outline-none focus:border-amber-500 h-16"
                  placeholder="Describe the flavors, seasoning, and details..."
                />
              </div>

              <div className="flex items-center gap-2 my-2">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={menuForm.isPopular}
                  onChange={(e) => setMenuForm(prev => ({ ...prev, isPopular: e.target.checked }))}
                  className="w-4 h-4 bg-stone-950 border border-stone-850 rounded text-amber-500 focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="isPopular" className="text-stone-600 text-xs cursor-pointer select-none">
                  Highlight as Popular Item (adds badge card wrapper)
                </label>
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  {editingItem ? 'Update Dish' : 'Publish Dish'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenuModal(false);
                    setEditingItem(null);
                  }}
                  className="px-6 py-3 bg-stone-950 text-stone-450 font-bold uppercase tracking-wider rounded-xl cursor-pointer border border-stone-850"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
