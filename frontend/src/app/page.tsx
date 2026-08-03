'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShoppingBag,
  MapPin,
  Plus,
  Minus,
  Search,
  Sparkles,
  Clock,
  Truck,
  CheckCircle2,
  Loader2,
  History,
  PlusCircle,
  Building,
  LogOut,
  Store,
  ArrowRight,
  Utensils
} from 'lucide-react';
import { mockRestaurants, mockCategories } from '../data/mockData';
import { OrderTracker } from '../components/OrderTracker';
import { ThaliBuilder } from '../components/ThaliBuilder';
import { CustomThali, GroupSession, GroupCartItem, CartDisplayItem } from '../types/food';
import { GroupOrderManager } from '../components/GroupOrderManager';
import { LoyaltyPanel } from '../components/LoyaltyPanel';
import { PreferenceWizard } from '../components/PreferenceWizard';
import {
  MenuItem,
  Customer,
  OrderItem,
  Order,
  OrderStatus,
  PaymentMethod,
  Restaurant,
} from '../types/food';
import { gsap, ScrollTrigger } from '../lib/gsap';
import Lenis from 'lenis';

interface FlyingItem {
  id: string;
  image: string;
  startX: number;
  startY: number;
}

export default function Dashboard() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'menu' | 'history'>('menu');

  // Customer & Registration state
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [showRegModal, setShowRegModal] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Restaurant & Menu states (fetched dynamically)
  const [restaurants, setRestaurants] = useState<Restaurant[]>(mockRestaurants);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant>(mockRestaurants[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  // Saved Addresses state
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressProvince, setNewAddressProvince] = useState('');
  const [newAddressDistrict, setNewAddressDistrict] = useState('');
  const [newAddressWard, setNewAddressWard] = useState('');
  const [newAddressLandmark, setNewAddressLandmark] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState('addr-home');

  // Cart state
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [cartPulse, setCartPulse] = useState(false);
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);

  // Checkout configuration
  const [deliveryType, setDeliveryType] = useState<'DELIVERY' | 'PICKUP'>('DELIVERY');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH_ON_DELIVERY');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  // Payment Redirection Simulation Modal
  const [simulatedGateway, setSimulatedGateway] = useState<string | null>(null);
  const [gatewayProgress, setGatewayProgress] = useState(0);

  // Conversational preference wizard states
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardPreferences, setWizardPreferences] = useState<{
    diet: 'VEG' | 'NON_VEG';
    spice: 'Mild' | 'Medium' | 'Hot' | 'Nepali-Hot';
    wrapper: 'Organic Wheat' | 'Whole Wheat Atta' | 'Spinach Emerald' | 'Beetroot Crimson';
    onion: boolean;
  } | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tb_wizard_preferences');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {}
      }
    }
    return null;
  });

  // Momo Customizer states
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [customDough, setCustomDough] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tb_wizard_preferences');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.wrapper) return parsed.wrapper;
        } catch {}
      }
    }
    return 'Organic Wheat';
  });
  const [customFilling, setCustomFilling] = useState('Minced Chicken & Spices');
  const [customFold, setCustomFold] = useState('Basket Fold');
  const [customSpice, setCustomSpice] = useState('Traditional Chutney');

  // Cart transition states
  const [isClearingCart, setIsClearingCart] = useState(false);
  const [pulsingItemId, setPulsingItemId] = useState<number | null>(null);
  const [vegFilter, setVegFilter] = useState<'ALL' | 'VEG' | 'NON_VEG'>('ALL');
  const [kitchenLoad, setKitchenLoad] = useState<'normal' | 'busy' | 'very_busy'>('normal');
  const [demoStageIndex, setDemoStageIndex] = useState<number | null>(null);
  const [selectedSpiceLevels, setSelectedSpiceLevels] = useState<Record<number, 'Mild' | 'Medium' | 'Hot'>>({});
  const [isThaliBuilderOpen, setIsThaliBuilderOpen] = useState(false);
  const [groupSession, setGroupSession] = useState<GroupSession | null>(() => {
    if (typeof window !== 'undefined') {
      const urlCode = new URLSearchParams(window.location.search).get('groupSession');
      if (urlCode) {
        const stored = localStorage.getItem(`tb_group_session_${urlCode}`);
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch {}
        }
      }
    }
    return null;
  });
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const urlCode = new URLSearchParams(window.location.search).get('groupSession');
      if (urlCode) {
        return localStorage.getItem(`tb_group_active_user_${urlCode}`) || null;
      }
    }
    return null;
  });
  const [groupCart, setGroupCart] = useState<GroupCartItem[]>(() => {
    if (typeof window !== 'undefined') {
      const urlCode = new URLSearchParams(window.location.search).get('groupSession');
      if (urlCode) {
        const stored = localStorage.getItem(`tb_group_cart_${urlCode}`);
        if (stored) {
          try {
            return JSON.parse(stored);
          } catch {}
        }
      }
    }
    return [];
  });

  const getKitchenETADetails = (baseTime: string) => {
    // TODO: Wire this load indicator to real order-volume or queue status API from the backend
    if (kitchenLoad === 'busy') {
      return {
        label: `Busy (${baseTime} + 10m)`,
        badgeClass: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
        iconColor: 'text-amber-500'
      };
    }
    if (kitchenLoad === 'very_busy') {
      return {
        label: `Very Busy (${baseTime} + 20m)`,
        badgeClass: 'bg-rose-500/10 text-rose-500 border border-rose-500/20 animate-pulse',
        iconColor: 'text-rose-500'
      };
    }
    return {
      label: `Normal (${baseTime})`,
      badgeClass: 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      iconColor: 'text-emerald-500'
    };
  };

  // GSAP Animation Container References
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const pinnedSectionRef = useRef<HTMLDivElement>(null);

  // Fetch updated restaurants from server to reflect admin changes
  const loadRestaurants = async () => {
    try {
      const res = await fetch('/api/restaurants');
      if (res.ok) {
        const data = await res.json();
        setRestaurants(data);
        // Sync active selection
        const matched = data.find((r: Restaurant) => r.id === selectedRestaurant.id);
        if (matched) {
          setSelectedRestaurant(matched);
        } else if (data.length > 0) {
          setSelectedRestaurant(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load restaurants from server memory:", err);
    }
  };

  const restoreSession = async (phone: string) => {
    setAuthLoading(true);
    try {
      const savedName = localStorage.getItem('tasty_bites_name') || 'Guest';
      const savedAddress = localStorage.getItem('tasty_bites_address') || 'Kathmandu, Nepal';

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: savedName, phone, address: savedAddress })
      });
      if (res.ok) {
        const userData = await res.json();
        setCustomer(userData);
        setShowRegModal(false);
        await loadOrders(phone);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAuthLoading(false);
    }
  };

  const loadOrders = useCallback(async (phone = customer?.phone) => {
    if (!phone) return;
    try {
      const res = await fetch('/api/orders', {
        headers: { 'Authorization': phone }
      });
      if (res.ok) {
        const ordersList = await res.json();
        setOrderHistory(ordersList);
        // Find if there is an active untracked order
        const incomplete = ordersList.find((o: Order) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
        if (incomplete) {
          setActiveOrder(incomplete);
        }
      }
    } catch (err) {
      console.error(err);
    }
  }, [customer?.phone]);

  const syncCustomerProfile = async () => {
    if (!customer) return;
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: customer.name, phone: customer.phone, address: customer.address })
      });
      if (res.ok) {
        const userData = await res.json();
        setCustomer(userData);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Base Initialization (Mount)
  useEffect(() => {
    setTimeout(() => {
      loadRestaurants();
    }, 0);
    const savedPhone = localStorage.getItem('tasty_bites_phone');
    if (savedPhone) {
      setTimeout(() => {
        restoreSession(savedPhone);
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Poll order tracker live to match staff status updates
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'DELIVERED' || activeOrder.status === 'CANCELLED') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${activeOrder.orderId}`, {
          headers: {
            'Authorization': customer?.phone || '',
          }
        });
        if (res.ok) {
          const updatedOrder = await res.json();
          setActiveOrder(updatedOrder);

          // Update local history
          setOrderHistory(prev => prev.map(o => o.orderId === updatedOrder.orderId ? updatedOrder : o));

          if (updatedOrder.status === 'DELIVERED' || updatedOrder.status === 'CANCELLED') {
            await syncCustomerProfile();
            await loadOrders();
          }
        }
      } catch (err) {
        console.error("Error polling order status:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeOrder, customer]);

  // Smooth Scroll (Lenis) & GSAP ScrollTrigger Integration
  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // 9. Smooth scroll integration via Lenis (only if motion is preferred)
    let lenis: Lenis | null = null;
    const updateLenis = (time: number) => {
      lenis?.raf(time * 1000);
    };

    if (!isReducedMotion) {
      lenis = new Lenis({
        duration: 1.6,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.15,
      });

      lenis.on('scroll', ScrollTrigger.update);

      gsap.ticker.add(updateLenis);

      gsap.ticker.lagSmoothing(0);
    }

    // GSAP ScrollTrigger Context
    const ctx = gsap.context(() => {
      if (isReducedMotion) return; // Skip animations if user prefers reduced motion

      // 8. Scroll-triggered headline character reveal
      gsap.fromTo('.reveal-char', 
        { opacity: 0, y: 15 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.02,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.reveal-headline-trigger',
            start: 'top 85%',
            end: 'top 60%',
            scrub: true,
          }
        }
      );

      // 5. Parallax depth on hero banner background & doodles + banner widening scale effect
      gsap.fromTo('.hero-parallax-img',
        { scale: 1.25, yPercent: -10 },
        {
          scale: 1,
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-parallax-trigger',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        }
      );

      gsap.fromTo('.hero-parallax-trigger',
        { scale: 0.82, borderRadius: '48px' },
        {
          scale: 1,
          borderRadius: '16px',
          ease: 'none',
          scrollTrigger: {
            trigger: '.hero-parallax-trigger',
            start: 'top 85%',
            end: 'top 30%',
            scrub: true,
          }
        }
      );

      gsap.to('.hero-doodle-1', {
        y: -70,
        rotation: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-parallax-trigger',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      gsap.to('.hero-doodle-2', {
        y: 60,
        x: -15,
        rotation: -20,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero-parallax-trigger',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });

      // 6. Kitchen grid horizontal slide track on scroll (without pinning!)
      const track = document.querySelector('.kitchens-slide-track');
      if (track) {
        gsap.fromTo('.kitchens-slide-track',
          { x: 0 },
          {
            x: () => {
              const trackWidth = track.scrollWidth;
              const containerWidth = track.parentElement?.clientWidth || 1200;
              return -(trackWidth - containerWidth);
            },
            ease: 'none',
            scrollTrigger: {
              trigger: '.kitchens-slide-track',
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1,
              invalidateOnRefresh: true
            }
          }
        );
      }

      // 7. Pinned delivery process section with staged animations
      const pinnedSection = pinnedSectionRef.current;
      if (pinnedSection) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: pinnedSection,
            start: 'top 80px',
            end: () => `+=${pinnedSection.offsetHeight}`,
            scrub: true,
            pin: true,
            invalidateOnRefresh: true,
          }
        });

        // Dynamic scroll progress line inside pin
        tl.to('.delivery-progress-line', {
          height: '85%',
          ease: 'none',
        }, 0);

        const cards = gsap.utils.toArray('.stage-card') as Element[];
        cards.forEach((card: Element) => {
          tl.to(card, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out'
          }, '+=0.2');
        });
      }

      // 4. Scroll-scrubbed card reveal on grid items
      const dishCards = gsap.utils.toArray('.dish-scrub-card') as Element[];
      dishCards.forEach((card: Element) => {
        gsap.fromTo(card,
          { opacity: 0.4, y: 40, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: 'power1.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 95%',
              end: 'top 75%',
              scrub: 0.5,
            }
          }
        );
      });

      // Parallax scale on dish card images
      const dishImages = gsap.utils.toArray('.dish-img-parallax') as Element[];
      dishImages.forEach((img: Element) => {
        gsap.fromTo(img,
          { scale: 1.12 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: img,
              start: 'top 100%',
              end: 'bottom 0%',
              scrub: true
            }
          }
        );
      });

      // 11. Journey progress line and card fade-in
      const journeyCards = gsap.utils.toArray('.journey-step-card') as Element[];
      gsap.to('.journey-grow-line', {
        height: '100%',
        ease: 'none',
        scrollTrigger: {
          trigger: '.journey-section-trigger',
          start: 'top 75%',
          end: 'bottom 80%',
          scrub: true,
        }
      });

      journeyCards.forEach((card: Element) => {
        gsap.to(card, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: card,
            start: 'top 85%',
            end: 'top 55%',
            scrub: 0.5,
          }
        });
      });

      // Spin journey step icons on scroll
      gsap.to('.journey-icon-spin', {
        rotation: 360,
        ease: 'none',
        scrollTrigger: {
          trigger: '.journey-section-trigger',
          start: 'top 80%',
          end: 'bottom 50%',
          scrub: true
        }
      });

      // 13. General Scroll-Reveal for all sections from top to bottom
      const revealElements = gsap.utils.toArray('.scroll-reveal') as Element[];
      revealElements.forEach((el: Element) => {
        gsap.fromTo(el,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 92%',
              toggleActions: 'play none none none',
            }
          }
        );
      });

    }, mainContainerRef);

    // Global image load listener that refreshes ScrollTrigger once all images finish loading
    const imgList = Array.from(document.querySelectorAll('img'));
    let loadedCount = 0;
    const handleImgLoad = () => {
      loadedCount++;
      if (loadedCount === imgList.length) {
        ScrollTrigger.refresh();
      }
    };
    imgList.forEach(img => {
      if (img.complete) {
        handleImgLoad();
      } else {
        img.addEventListener('load', handleImgLoad);
        img.addEventListener('error', handleImgLoad);
      }
    });

    // ResizeObserver on the main page container to refresh trigger locations on height changes
    let resizeObserver: ResizeObserver | null = null;
    if (mainContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });
      resizeObserver.observe(mainContainerRef.current);
    }

    ScrollTrigger.refresh();

    // 3. Clean up context and smooth scroller on unmount to prevent leaks
    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach(t => t.kill());
      gsap.ticker.remove(updateLenis);
      if (lenis) {
        lenis.destroy();
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      imgList.forEach(img => {
        img.removeEventListener('load', handleImgLoad);
        img.removeEventListener('error', handleImgLoad);
      });
    };
  }, [restaurants, activeTab, selectedCategory, searchQuery, vegFilter]);

  // 12. Smooth category stagger fade-in reveal
  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.fromTo('.dish-scrub-card',
        { opacity: 0, y: 15, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.35,
          stagger: 0.04,
          ease: 'power2.out',
          overwrite: 'auto'
        }
      );
    }
  }, [selectedCategory, vegFilter]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regPhone || !regAddress) return;

    setAuthLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, phone: regPhone, address: regAddress })
      });
      if (!res.ok) {
        const errData = await res.json();
        alert(`❌ Registration failed: ${errData.error}`);
        return;
      }
      const userData = await res.json();
      setCustomer(userData);
      localStorage.setItem('tasty_bites_phone', regPhone);
      localStorage.setItem('tasty_bites_name', regName);
      localStorage.setItem('tasty_bites_address', regAddress);
      setShowRegModal(false);
      await loadOrders(regPhone);
    } catch (err) {
      alert("❌ Server connection issue. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tasty_bites_phone');
    localStorage.removeItem('tasty_bites_name');
    localStorage.removeItem('tasty_bites_address');
    setCustomer(null);
    setOrderHistory([]);
    setCart([]);
    setActiveOrder(null);
    setShowRegModal(true);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer || !newAddressLabel) return;

    if (!newAddressWard.trim() || !newAddressLandmark.trim()) {
      alert("Please fill in at least the Municipality/Ward and Landmark description.");
      return;
    }

    const fullAddress = `${newAddressProvince.trim() || 'Bagmati'}, ${newAddressDistrict.trim() || 'Kathmandu'}, Ward ${newAddressWard.trim()} (Near ${newAddressLandmark.trim()})`;

    try {
      const res = await fetch('/api/addresses/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': customer.phone
        },
        body: JSON.stringify({ label: newAddressLabel.trim(), address: fullAddress.trim() })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setCustomer(updatedUser);
        setNewAddressLabel('');
        setNewAddressProvince('');
        setNewAddressDistrict('');
        setNewAddressWard('');
        setNewAddressLandmark('');
        setShowAddressForm(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Synchronize group cart with local storage to support multi-tab synchronization!
  useEffect(() => {
    if (!groupSession) return;
    const key = `tb_group_cart_${groupSession.id}`;
    const sessionKey = `tb_group_session_${groupSession.id}`;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setGroupCart(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Failed to sync group cart", err);
        }
      }
      if (e.key === sessionKey && e.newValue) {
        try {
          setGroupSession(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Failed to sync group session", err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [groupSession?.id]);

  const saveGroupCart = (newGroupCart: GroupCartItem[]) => {
    if (!groupSession) return;
    setGroupCart(newGroupCart);
    localStorage.setItem(`tb_group_cart_${groupSession.id}`, JSON.stringify(newGroupCart));
  };

  const saveGroupSession = (newSession: GroupSession) => {
    setGroupSession(newSession);
    localStorage.setItem(`tb_group_session_${newSession.id}`, JSON.stringify(newSession));
  };

  const handleStartGroupSession = (hostName: string) => {
    const newSessionId = 'TB-G-' + Math.floor(1000 + Math.random() * 9000);
    const newSession: GroupSession = {
      id: newSessionId,
      hostName,
      participants: [hostName],
      splitMethod: 'HOST_PAYS'
    };
    saveGroupSession(newSession);
    setCurrentUser(hostName);
    saveGroupCart([]);
  };

  const handleJoinGroupSession = (code: string, name: string) => {
    const sessionKey = `tb_group_session_${code}`;
    const stored = localStorage.getItem(sessionKey);
    if (!stored) {
      alert("No active session found with code " + code);
      return;
    }
    try {
      const session = JSON.parse(stored) as GroupSession;
      if (!session.participants.includes(name)) {
        session.participants.push(name);
      }
      saveGroupSession(session);
      setCurrentUser(name);
      
      const cartKey = `tb_group_cart_${code}`;
      const storedCart = localStorage.getItem(cartKey);
      if (storedCart) {
        setGroupCart(JSON.parse(storedCart));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to join group session.");
    }
  };

  const handleLeaveGroupSession = () => {
    if (groupSession) {
      localStorage.removeItem(`tb_group_session_${groupSession.id}`);
      localStorage.removeItem(`tb_group_cart_${groupSession.id}`);
    }
    setGroupSession(null);
    setCurrentUser(null);
    setGroupCart([]);
  };

  const handleAddParticipant = (name: string) => {
    if (!groupSession) return;
    if (groupSession.participants.includes(name)) {
      alert("Participant already exists!");
      return;
    }
    const newSession = {
      ...groupSession,
      participants: [...groupSession.participants, name]
    };
    saveGroupSession(newSession);
  };

  const handleRemoveParticipant = (name: string) => {
    if (!groupSession) return;
    const newSession = {
      ...groupSession,
      participants: groupSession.participants.filter(p => p !== name)
    };
    saveGroupSession(newSession);
    const newGroupCart = groupCart.filter(item => item.participant !== name);
    saveGroupCart(newGroupCart);
  };

  const handleSetSplitMethod = (method: 'HOST_PAYS' | 'EQUAL_SPLIT') => {
    if (!groupSession) return;
    const newSession = {
      ...groupSession,
      splitMethod: method
    };
    saveGroupSession(newSession);
  };

  const handleSwitchUser = (name: string) => {
    setCurrentUser(name);
  };

  const addToGroupCart = (menuItem: MenuItem, spiceLevel?: 'Mild' | 'Medium' | 'Hot') => {
    if (!groupSession || !currentUser) return;
    const newGroupCart = [...groupCart];
    const existing = newGroupCart.find(
      (i) => i.participant === currentUser &&
             i.menuItem.id === menuItem.id &&
             i.spiceLevel === spiceLevel
    );
    if (existing) {
      existing.quantity += 1;
    } else {
      newGroupCart.push({
        id: Math.random().toString(36).substring(4),
        participant: currentUser,
        menuItem,
        quantity: 1,
        spiceLevel,
      });
    }
    saveGroupCart(newGroupCart);
  };

  const updateGroupCartQuantity = (menuItemId: number, amount: number, spiceLevel?: 'Mild' | 'Medium' | 'Hot', participant?: string) => {
    if (!groupSession) return;
    const targetUser = participant || currentUser;
    if (!targetUser) return;
    let newGroupCart = [...groupCart];
    const existing = newGroupCart.find(
      (i) => i.participant === targetUser &&
             i.menuItem.id === menuItemId &&
             i.spiceLevel === spiceLevel
    );
    if (!existing) return;
    if (existing.quantity + amount <= 0) {
      newGroupCart = newGroupCart.filter(
        (i) => !(i.participant === targetUser &&
                 i.menuItem.id === menuItemId &&
                 i.spiceLevel === spiceLevel)
      );
    } else {
      existing.quantity += amount;
    }
    saveGroupCart(newGroupCart);
  };

  // Cart operations (wrapped in useCallback to declare pure helper and fix purity linter check)
  const addToCart = useCallback((menuItem: MenuItem, e: React.MouseEvent, spiceLevel?: 'Mild' | 'Medium' | 'Hot') => {
    if (menuItem.isAvailable === false) {
      alert("This item is currently sold out!");
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const flyingId = Math.random().toString(36).substring(7);
    const newFlying: FlyingItem = {
      id: flyingId,
      image: menuItem.image,
      startX: rect.left,
      startY: rect.top,
    };
    setFlyingItems((prev) => [...prev, newFlying]);

    if (groupSession) {
      addToGroupCart(menuItem, spiceLevel);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.menuItem.id === menuItem.id && item.spiceLevel === spiceLevel);
      if (existing) {
        return prev.map((item) =>
          item.menuItem.id === menuItem.id && item.spiceLevel === spiceLevel ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { menuItem, quantity: 1, spiceLevel }];
    });

    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 300);
  }, [groupSession, currentUser, groupCart]);

  const handleAddCustomMomo = (e: React.MouseEvent) => {
    const customMomoItem: MenuItem = {
      id: Math.floor(200000 + Math.random() * 800000),
      restaurantId: selectedRestaurant.id,
      name: `Custom ${customDough} Momo (${customFilling})`,
      price: 240,
      category: 'Appetizers',
      image: customDough === 'Beetroot Crimson' 
        ? 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80'
        : customDough === 'Spinach Emerald'
        ? 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
      description: `Customized folding style: ${customFold}. Spicy level: ${customSpice}.`,
      prepTime: '15-20 min',
      isAvailable: true
    };

    addToCart(customMomoItem, e);
  };

  const handleWizardConfirm = (prefs: {
    diet: 'VEG' | 'NON_VEG';
    spice: 'Mild' | 'Medium' | 'Hot' | 'Nepali-Hot';
    wrapper: 'Organic Wheat' | 'Whole Wheat Atta' | 'Spinach Emerald' | 'Beetroot Crimson';
    onion: boolean;
  }) => {
    setWizardPreferences(prefs);
    localStorage.setItem('tb_wizard_preferences', JSON.stringify(prefs));
    setVegFilter(prefs.diet);
    
    // Set customizer defaults to inherit wizard choices
    setCustomDough(prefs.wrapper);
    if (prefs.diet === 'VEG') {
      setCustomFilling('Paneer & Fine Cabbage');
    } else {
      setCustomFilling('Minced Chicken & Spices');
    }
    
    if (prefs.spice === 'Mild') {
      setCustomSpice('Traditional Chutney');
    } else if (prefs.spice === 'Medium') {
      setCustomSpice('Zingy Tomato Sauce');
    } else {
      setCustomSpice('Firewood Chili Dip');
    }

    // Scroll to menu explorer view automatically
    const el = document.querySelector('.horizontal-scroll-container');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddCustomThali = (thali: CustomThali, totalPrice: number) => {
    const thaliItem: MenuItem = {
      id: Math.floor(100000 + Math.random() * 900000),
      restaurantId: selectedRestaurant.id,
      name: `Custom Thakali Thali (${thali.base.name})`,
      price: totalPrice,
      category: 'Main Course',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      description: `${thali.base.name} served with ${thali.curries.map(c => c.name).join(', ')} and ${thali.achar.name}.`,
      prepTime: '20-25 min',
      isAvailable: true
    };

    if (groupSession && currentUser) {
      const newGroupCart: GroupCartItem[] = [...groupCart, {
        id: Math.random().toString(36).substring(4),
        participant: currentUser,
        menuItem: thaliItem,
        quantity: 1,
        customThali: thali
      }];
      saveGroupCart(newGroupCart);
      alert("🍛 Custom Thali added to group basket!");
      return;
    }

    setCart((prev) => {
      return [...prev, { menuItem: thaliItem, quantity: 1, customThali: thali }];
    });

    setCartPulse(true);
    setTimeout(() => setCartPulse(false), 300);
  };

  const updateCartQuantity = (menuItemId: number, amount: number, spiceLevel?: 'Mild' | 'Medium' | 'Hot', participant?: string) => {
    setPulsingItemId(menuItemId);
    setTimeout(() => setPulsingItemId(null), 200);

    if (groupSession) {
      updateGroupCartQuantity(menuItemId, amount, spiceLevel, participant);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.menuItem.id === menuItemId && item.spiceLevel === spiceLevel);
      if (!existing) return prev;
      if (existing.quantity + amount <= 0) {
        return prev.filter((item) => !(item.menuItem.id === menuItemId && item.spiceLevel === spiceLevel));
      }
      return prev.map((item) =>
        item.menuItem.id === menuItemId && item.spiceLevel === spiceLevel ? { ...item, quantity: item.quantity + amount } : item
      );
    });
  };

  const clearCart = () => {
    setIsClearingCart(true);
    setTimeout(() => {
      if (groupSession) {
        saveGroupCart([]);
      } else {
        setCart([]);
      }
      setIsClearingCart(false);
    }, 300);
  };

  const getItemQuantity = (menuItemId: number, spiceLevel?: 'Mild' | 'Medium' | 'Hot') => {
    if (groupSession && currentUser) {
      return groupCart.find((item) => item.participant === currentUser && item.menuItem.id === menuItemId && item.spiceLevel === spiceLevel)?.quantity || 0;
    }
    return cart.find((item) => item.menuItem.id === menuItemId && item.spiceLevel === spiceLevel)?.quantity || 0;
  };

  // Pricing calculations
  const cartSubtotal = groupSession
    ? groupCart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
    : cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0);
  const isEligibleFreeDelivery = cartSubtotal > 500;
  const deliveryCharge = deliveryType === 'PICKUP' ? 0 : (isEligibleFreeDelivery || cartSubtotal === 0 ? 0 : selectedRestaurant.deliveryFee);
  const cartTotal = cartSubtotal + deliveryCharge;
  const isMinimumOrderMet = cartSubtotal >= 200;

  // Perform checkout action
  const completeCheckout = useCallback(async (payload: {
    restaurantId: string;
    cartItems: { menuItemId: number; quantity: number }[];
    paymentMethod: PaymentMethod;
    deliveryAddress: string;
    deliveryType: string;
    paymentId?: string;
    cardToken?: string;
  }) => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': customer?.phone || '',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        alert(`❌ Checkout failed: ${errData.error}`);
        return;
      }

      const order = await res.json();
      setActiveOrder(order);
      setCart([]);
      await loadOrders(customer?.phone);
    } catch (err) {
      alert("❌ Problem communicating with food servers. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  }, [customer, loadOrders]);

  // eSewa / Khalti simulation loader loop
  const triggerOnlineGateway = useCallback((gateway: string, checkoutPayload: {
    restaurantId: string;
    cartItems: { menuItemId: number; quantity: number }[];
    paymentMethod: PaymentMethod;
    deliveryAddress: string;
    deliveryType: string;
    cardToken?: string;
  }) => {
    setSimulatedGateway(gateway);
    setGatewayProgress(0);
    const interval = setInterval(() => {
      setGatewayProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setSimulatedGateway(null);
            completeCheckout({ ...checkoutPayload, paymentId: 'GATEWAY-REF-' + Math.floor(Math.random()*900000) });
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 500);
  }, [completeCheckout]);

  const handleCheckout = useCallback(async () => {
    if (!customer) return;
    if (groupSession ? groupCart.length === 0 : cart.length === 0) return;
    if (!isMinimumOrderMet) {
      alert("❌ Minimum order amount is Rs. 200.");
      return;
    }

    const deliveryAddressObj = customer.addresses.find((a) => a.id === selectedAddressId);
    const activeAddressText = deliveryType === 'PICKUP' 
      ? 'Self-Pickup from Durbar Marg Restaurant Kitchen'
      : (deliveryAddressObj ? deliveryAddressObj.address : customer.address);

    const checkoutPayload = {
      restaurantId: selectedRestaurant.id,
      cartItems: groupSession
        ? groupCart.map((item) => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            spiceLevel: item.spiceLevel,
            participant: item.participant,
          }))
        : cart.map((item) => ({
            menuItemId: item.menuItem.id,
            quantity: item.quantity,
            spiceLevel: item.spiceLevel,
          })),
      paymentMethod,
      deliveryAddress: activeAddressText,
      deliveryType,
      cardToken: paymentMethod === 'CARD' ? 'TOK-' + Math.random().toString(36).substring(4).toUpperCase() : undefined
    };

    if (paymentMethod === 'ESEWA' || paymentMethod === 'KHALTI') {
      triggerOnlineGateway(paymentMethod, checkoutPayload);
    } else {
      completeCheckout(checkoutPayload);
    }
  }, [customer, cart, groupSession, groupCart, isMinimumOrderMet, selectedAddressId, deliveryType, selectedRestaurant.id, paymentMethod, triggerOnlineGateway, completeCheckout]);

  // One-click Re-order implementation
  const handleReorder = (oldOrder: Order) => {
    const activeRest = restaurants.find(r => r.id === oldOrder.restaurantId);
    if (!activeRest) {
      alert("This kitchen is currently unavailable.");
      return;
    }

    setSelectedRestaurant(activeRest);
    const newCartItems: OrderItem[] = [];
    let hasSoldOut = false;

    oldOrder.items.forEach(oldItem => {
      const matchingMenu = activeRest.menu.find(m => m.id === oldItem.menuItem.id);
      if (matchingMenu && matchingMenu.isAvailable !== false) {
        newCartItems.push({
          menuItem: matchingMenu,
          quantity: oldItem.quantity
        });
      } else {
        hasSoldOut = true;
      }
    });

    if (newCartItems.length === 0) {
      alert("❌ All items in this order are currently sold out.");
      return;
    }

    setCart(newCartItems);
    setActiveTab('menu');

    if (hasSoldOut) {
      alert("⚠️ Some items from your original order are sold out and were not added to the cart.");
    } else {
      alert("🛒 Order items added to your active cart!");
    }
  };

  // Split headline text into characters for staggered viewport entrances
  const splitText = (text: string) => {
    return text.split('').map((char, idx) => (
      <span key={idx} className="reveal-char inline-block translate-y-4 opacity-0 transition-transform">
        {char === ' ' ? '\u00A0' : char}
      </span>
    ));
  };

  // Search and Category filters
  const filteredItems = selectedRestaurant.menu.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesCuisine = selectedCuisine === 'All' || item.cuisine === selectedCuisine;
    const matchesVeg =
      vegFilter === 'ALL' ||
      (vegFilter === 'VEG' && item.isVeg) ||
      (vegFilter === 'NON_VEG' && !item.isVeg);
    return matchesSearch && matchesCategory && matchesCuisine && matchesVeg;
  });

  const getVegAccentClass = () => {
    if (vegFilter === 'VEG') return 'border-emerald-500/20 text-emerald-500 hover:border-emerald-500/40';
    if (vegFilter === 'NON_VEG') return 'border-rose-500/20 text-rose-500 hover:border-rose-500/40';
    return 'border-amber-500/20 text-amber-500 hover:border-amber-500/40';
  };

  const getVegBadgeClass = () => {
    if (vegFilter === 'VEG') return 'bg-emerald-600 text-white';
    if (vegFilter === 'NON_VEG') return 'bg-rose-700 text-white';
    return 'bg-amber-500 text-stone-950';
  };

  const getWizardDefaultSpice = () => {
    if (!wizardPreferences) return 'Medium';
    if (wizardPreferences.spice === 'Mild') return 'Mild';
    if (wizardPreferences.spice === 'Hot' || wizardPreferences.spice === 'Nepali-Hot') return 'Hot';
    return 'Medium';
  };

  return (
    <div ref={mainContainerRef} className="min-h-screen bg-background text-foreground font-sans relative selection:bg-amber-500 selection:text-black overflow-x-hidden">
      {/* ANNOUNCEMENT BAR */}
      <div className="bg-amber-500 text-stone-950 text-center py-2.5 px-4 text-[10.5px] font-black uppercase tracking-widest border-b border-stone-850 relative z-55">
        🎉 Grand Opening Special: Get Free Delivery on Orders Over Rs. 500!
      </div>
      {/* HEADER SECTION */}
      <header className="border-b border-stone-850 bg-stone-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-stone-950 font-extrabold shadow-lg shadow-amber-500/10">
              TB
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight uppercase serif-title text-amber-500">Tasty Bites</h1>
              <p className="text-[9px] font-bold text-stone-500 tracking-wider">KATHMANDU CULINARY</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex gap-1.5 bg-stone-900/50 border border-stone-850 p-0.5 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('menu')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'menu' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-amber-500'
                }`}
              >
                Menu Explorer
              </button>
              <button
                onClick={() => {
                  setActiveTab('history');
                  if (customer) loadOrders(customer.phone);
                }}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'history' ? 'bg-amber-500 text-stone-950' : 'text-stone-400 hover:text-amber-500'
                }`}
              >
                <History className="w-3.5 h-3.5" /> Order History
              </button>
            </nav>

            <a href="/admin" className="text-xs text-stone-400 hover:text-amber-500 font-bold transition-all border border-stone-800 hover:border-amber-500/40 px-3 py-1.5 rounded-xl bg-stone-950">
              Staff Portal
            </a>

            {customer ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] font-bold text-stone-500 block uppercase">Welcome</span>
                  <strong className="text-xs text-stone-100 font-extrabold">{customer.name}</strong>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-red-400 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowRegModal(true)}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black uppercase tracking-wider rounded-full shadow transition-colors cursor-pointer"
              >
                Register
              </button>
            )}
          </div>
        </div>
      </header>

      {/* FLYING ADD ITEM EFFECTS */}
      {flyingItems.map((item) => (
        <div
          key={item.id}
          className="fixed z-50 pointer-events-none w-8 h-8 rounded-full overflow-hidden border border-amber-500 animate-fly-to-cart shadow-xl"
          style={
            {
              '--start-x': `${item.startX}px`,
              '--start-y': `${item.startY}px`,
            } as React.CSSProperties
          }
          onAnimationEnd={() => setFlyingItems((prev) => prev.filter((f) => f.id !== item.id))}
        >
          <img src={item.image} className="w-full h-full object-cover" alt="" />
        </div>
      ))}

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col gap-8">
        
        {/* ACTIVE ORDER LIVE STATUS TRACKER */}
        {activeOrder && (
          <div className="scroll-reveal w-full">
            {(() => {
              const getStageIndexFromStatus = (status: OrderStatus): number => {
                switch (status) {
                  case 'PENDING': return 0;
                  case 'CONFIRMED': return 1;
                  case 'PREPARING': return 2;
                  case 'OUT_FOR_DELIVERY': return 4;
                  case 'DELIVERED': return 5;
                  case 'CANCELLED': return 0;
                  default: return 0;
                }
              };
              const activeIndex = demoStageIndex !== null ? demoStageIndex : getStageIndexFromStatus(activeOrder.status);

              return (
                <div className="flex flex-col gap-4">
                  <OrderTracker
                    currentStageIndex={activeIndex}
                    onStageChange={(idx) => setDemoStageIndex(idx)}
                    isDemoMode={true}
                  />
                  {activeOrder.status === 'CANCELLED' && (
                    <div className="bg-rose-900/10 border border-rose-900/20 p-4 rounded-2xl text-xs text-rose-500 font-bold uppercase tracking-wider text-center">
                      ⚠️ This order was cancelled: {activeOrder.cancellationReason || 'Staff Override'}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* 2. HISTORY VIEW */}
        {activeTab === 'history' && (
          <div className="flex flex-col gap-6 scroll-reveal">
            {/* LOYALTY PROFILE ACHIEVEMENTS */}
            <LoyaltyPanel orderCount={orderHistory.length} />

            <div className="flex justify-between items-center mt-2">
              <h2 className="text-2xl font-black serif-title tracking-tight text-stone-100">Order Receipts</h2>
              <span className="text-xs text-stone-400 font-semibold">{orderHistory.length} orders total</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orderHistory.map((order) => (
                <div key={order.orderId} className="glass-panel rounded-[28px] p-6 border border-stone-850 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex justify-between items-center gap-3 mb-3 pb-3 border-b border-stone-900">
                      <div>
                        <strong className="text-xs text-stone-200 uppercase block">#{order.orderId}</strong>
                        <span className="text-[10px] text-stone-500 font-semibold">{order.orderTime}</span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded text-[9px] uppercase font-black tracking-wider border ${
                        order.status === 'DELIVERED'
                          ? 'bg-green-500/10 border-green-500/20 text-green-400'
                          : order.status === 'CANCELLED'
                          ? 'bg-red-500/10 border-red-500/20 text-red-400'
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 mb-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span className="text-stone-300">
                            {item.menuItem.name} <strong className="text-stone-500 font-bold">x{item.quantity}</strong>
                          </span>
                          <span className="text-stone-400 font-semibold">Rs. {item.menuItem.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-[10px] text-stone-500 border-t border-stone-900 pt-2.5 flex justify-between">
                      <span>Address: {order.customer.address}</span>
                      <span>{order.paymentMethod.replace(/_/g, ' ')}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2.5 border-t border-stone-900 mt-1">
                    <div>
                      <span className="text-[9px] font-bold text-stone-500 block uppercase">Paid Amount</span>
                      <strong className="text-amber-500 text-sm font-black">Rs. {order.total}</strong>
                    </div>

                    <button
                      onClick={() => handleReorder(order)}
                      className="px-4 py-2 bg-stone-900 hover:bg-amber-500 text-stone-300 hover:text-black rounded-xl text-[10px] uppercase font-black tracking-wider transition-all border border-stone-850 hover:border-amber-500 flex items-center gap-1 cursor-pointer"
                    >
                      Reorder This
                    </button>
                  </div>
                </div>
              ))}

              {orderHistory.length === 0 && (
                <div className="col-span-full glass-panel rounded-[32px] p-12 text-center">
                  <p className="text-stone-500 text-xs">No historical receipts found for your account.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. MENU / CATALOG EXPLORER */}
        {activeTab === 'menu' && (
          <div className="block w-full">
            {/* HERO SECTION */}
            <div className="relative flex flex-col items-center text-center py-10 px-4 md:py-16 md:px-8 w-full bg-background mb-8 scroll-reveal">
              {/* Heading Text Block with organic doodles */}
              <div className="relative z-10 max-w-3xl flex flex-col items-center gap-5 mb-12">
                {/* Hand-drawn leaf doodle (top-left) */}
                <svg className="absolute -top-12 -left-12 md:-left-20 w-16 h-16 text-amber-500 opacity-20 pointer-events-none transform -rotate-12 hero-doodle-1" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M50,90 C30,70 20,50 30,30 C40,10 60,10 70,30 C80,50 70,70 50,90 Z" />
                  <path d="M50,90 C50,60 50,40 50,20" />
                  <path d="M50,70 C40,65 35,55 35,50" />
                  <path d="M50,55 C40,50 38,40 38,35" />
                  <path d="M50,65 C60,60 65,50 65,45" />
                  <path d="M50,50 C60,45 62,35 62,30" />
                </svg>

                {/* Hand-drawn squiggle doodle (bottom-right) */}
                <svg className="absolute -bottom-8 -right-12 md:-right-20 w-24 h-10 text-amber-500 opacity-20 pointer-events-none hero-doodle-2" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10,15 Q30,5 50,15 T90,15" />
                </svg>

                <span className="bg-stone-900 border border-stone-850 text-gold font-black text-[10px] tracking-widest px-4 py-1.5 rounded-full uppercase shadow-sm">
                  Featured Kitchen
                </span>

                <h2 className="text-4xl md:text-6xl font-black text-amber-500 serif-title tracking-tight leading-tight">
                  Handmade Specialties.<br />Cooked Fresh & Delivered Hot.
                </h2>
                
                <p className="text-stone-700 text-sm md:text-base leading-relaxed max-w-xl font-medium">
                  Zero artificial preservatives. Hand-kneaded dough and locally sourced fresh ingredients from Kathmandu Valley.
                </p>

                <div className="flex gap-4 items-center justify-center text-xs font-semibold text-stone-700 flex-wrap">
                  <span className="flex items-center gap-1.5"><Clock className="w-4.5 h-4.5 text-amber-500" /> Prepared in {selectedRestaurant.prepTime}</span>
                  <span className="flex items-center gap-1.5"><Truck className="w-4.5 h-4.5 text-amber-500" /> Delivery: Rs. {selectedRestaurant.deliveryFee}</span>
                </div>
                
                <button
                  onClick={() => setIsWizardOpen(true)}
                  className="mt-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black uppercase tracking-widest rounded-full shadow-lg shadow-amber-500/10 transition-colors cursor-pointer"
                >
                  Order Now
                </button>
              </div>

              {/* Large Real-Food Photography banner below the text */}
              <div className="w-full relative rounded-[40px] overflow-hidden min-h-[300px] md:min-h-[440px] border border-stone-850 shadow-md hero-parallax-trigger scroll-reveal">
                <img
                  src={selectedRestaurant.image}
                  alt={selectedRestaurant.name}
                  className="absolute inset-0 w-full h-full object-cover hero-parallax-img origin-top"
                  onLoad={() => {
                    ScrollTrigger.refresh();
                  }}
                />
              </div>
            </div>

            {/* 6. OUR MASTER KITCHENS (SLIDING PARALLAX TRACK) */}
            <div className="bg-stone-900 rounded-[40px] border border-stone-850 p-8 md:p-12 mb-8 relative overflow-hidden scroll-reveal">
              <div className="max-w-xl mb-8">
                <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase block mb-1">
                  Signature Showcase
                </span>
                <h2 className="text-3xl font-black serif-title tracking-tight text-stone-100 reveal-headline-trigger">
                  {splitText('Our Master Kitchens')}
                </h2>
              </div>
              <div className="overflow-x-hidden my-4 relative w-full no-scrollbar">
                <div className="flex gap-6 kitchens-slide-track w-max">
                  {restaurants.map((rest) => (
                    <div key={rest.id} className="w-[340px] shrink-0 glass-panel rounded-[32px] overflow-hidden border border-stone-850 p-5 flex flex-col justify-between min-h-[360px] gap-4 shadow-xl bg-stone-900/40 hover:scale-101 hover:border-amber-500/30 transition-all duration-300">
                      <div className="flex flex-col gap-4">
                        <div className="relative h-44 rounded-2xl overflow-hidden border border-stone-850">
                          <img
                            src={rest.image}
                            className="w-full h-full object-cover animate-pulse-slow"
                            alt={rest.name}
                            onLoad={() => {
                              ScrollTrigger.refresh();
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <span className="absolute bottom-3 left-3 bg-amber-500 text-black text-[9px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full">
                            {rest.cuisine.split(',')[0]}
                          </span>
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <h3 className="text-base font-extrabold text-stone-100">{rest.name}</h3>
                            <span className="text-[10px] text-amber-500 font-bold shrink-0">★ {rest.rating}</span>
                          </div>
                          <p className="text-[11px] text-stone-400 leading-relaxed">
                            {rest.cuisine} • Prep: {rest.prepTime}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedRestaurant(rest);
                          setSelectedCategory('All');
                          setSearchQuery('');
                        }}
                        className={`w-full py-2.5 rounded-xl text-[10px] uppercase tracking-wider font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          selectedRestaurant.id === rest.id
                            ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10'
                            : 'bg-stone-900 hover:bg-stone-850 text-stone-300 border border-stone-800'
                        }`}
                      >
                        {selectedRestaurant.id === rest.id ? 'Active Kitchen' : 'Select Kitchen'} <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 7. PINNED DELIVERY PROCESS STAGES */}
            <div ref={pinnedSectionRef} className="pinned-staged-container min-h-[550px] bg-stone-900 border border-stone-850 rounded-[40px] p-8 md:p-12 relative flex flex-col md:flex-row gap-8 items-center justify-between overflow-hidden mb-8 scroll-reveal">
              <div className="flex-1 max-w-sm">
                <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase block mb-1">
                  Artisan Commitment
                </span>
                <h2 className="text-3xl font-extrabold serif-title tracking-tight text-stone-100 leading-tight mb-4">
                  How We Deliver Freshness
                </h2>
                <p className="text-xs text-stone-400 leading-relaxed">
                  Tasty Bites utilizes zero-mile supply lines and heat-insulating boxes to guarantee your dumplings sizzle upon arrival.
                </p>
              </div>
                
                <div className="flex-1 w-full flex flex-col gap-4 relative max-w-md pl-6">
                  {/* Dashed connector line */}
                  <div className="absolute left-3 top-6 bottom-6 w-[2px] bg-stone-850" />
                  {/* Dynamic scroll progress line */}
                  <div className="absolute left-3 top-6 w-[2px] bg-amber-500 origin-top delivery-progress-line" style={{ height: '0%' }} />
                  <div className="stage-card p-5 bg-stone-900/80 border border-stone-850 rounded-2xl flex gap-4 items-center opacity-0 scale-95 transform translate-y-6">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shrink-0">
                      <Building className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-stone-200 uppercase tracking-wider mb-0.5">Step 1: Direct Ingestion</h3>
                      <p className="text-[10px] text-stone-400">All local ingredients are harvested and brought to our kitchen within 2 hours.</p>
                    </div>
                  </div>
                  
                  <div className="stage-card p-5 bg-stone-900/80 border border-stone-850 rounded-2xl flex gap-4 items-center opacity-0 scale-95 transform translate-y-6">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shrink-0">
                      <Utensils className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-stone-200 uppercase tracking-wider mb-0.5">Step 2: Handmade Prep</h3>
                      <p className="text-[10px] text-stone-400">Dim sum dough is hand-kneaded and loaded with savory fillings by our kitchen chefs.</p>
                    </div>
                  </div>
                  
                  <div className="stage-card p-5 bg-stone-900/80 border border-stone-850 rounded-2xl flex gap-4 items-center opacity-0 scale-95 transform translate-y-6">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shrink-0">
                      <Truck className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-stone-200 uppercase tracking-wider mb-0.5">Step 3: Thermal Transport</h3>
                      <p className="text-[10px] text-stone-400">Food is boxed inside customized heated delivery pouches to maintain core temperatures.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW SECTION: SOIL-TO-PLATE INTERACTIVE ROADMAP */}
            <div className="relative bg-stone-900 border border-stone-850 rounded-[40px] p-8 md:p-12 mb-8 overflow-hidden journey-section-trigger scroll-reveal">
              <div className="max-w-xl mb-12">
                <span className="text-[10px] font-black text-amber-500 tracking-widest uppercase block mb-1">
                  Traceable Sourcing
                </span>
                <h2 className="text-3xl font-black serif-title tracking-tight text-stone-100 leading-tight">
                  Soil to Plate Journey
                </h2>
                <p className="text-xs text-stone-400 leading-relaxed mt-2">
                  Follow the journey of our ingredients from organic farms in Kathmandu Valley to your table. Scroll down to draw the path!
                </p>
              </div>

              {/* Sourcing Timeline */}
              <div className="relative flex flex-col gap-16 md:gap-24 my-8 pl-8 md:pl-0">
                {/* SVG Vine Path linking stages (GSAP animated) */}
                <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-1 md:-translate-x-1/2 bg-stone-950 rounded-full overflow-hidden">
                  <div className="w-full bg-amber-500 transition-all duration-300 journey-grow-line" style={{ height: '0%' }} />
                </div>

                {/* Stage 1: Harvesting */}
                <div className="relative flex flex-col md:flex-row gap-6 md:gap-12 items-center journey-step-card opacity-30 transform translate-y-6 transition-all duration-700">
                  <div className="flex-1 text-left md:text-right">
                    <span className="text-[9px] font-black text-amber-500 tracking-widest uppercase block mb-1">Stage 01</span>
                    <h3 className="text-base font-extrabold text-stone-100">Kathmandu Organic Farms</h3>
                    <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                      We partner directly with local farmers in Kakani and Lubhu to harvest organic spring onions, cilantro, and seasonal veggies at sunrise.
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center border-4 border-stone-900 shrink-0 z-10 md:-mx-4.5 journey-icon-spin">
                    01
                  </div>
                  <div className="flex-1 w-full rounded-2xl overflow-hidden h-40 border border-stone-850 shadow-md">
                    <img
                      src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80"
                      className="w-full h-full object-cover"
                      alt=""
                      onLoad={() => {
                        ScrollTrigger.refresh();
                      }}
                    />
                  </div>
                </div>

                {/* Stage 2: Sourcing Spices */}
                <div className="relative flex flex-col md:flex-row-reverse gap-6 md:gap-12 items-center journey-step-card opacity-30 transform translate-y-6 transition-all duration-700">
                  <div className="flex-1 text-left">
                    <span className="text-[9px] font-black text-amber-500 tracking-widest uppercase block mb-1">Stage 02</span>
                    <h3 className="text-base font-extrabold text-stone-100">Hand-Ground Himalayan Spices</h3>
                    <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                      Timur peppers from Mustang, cumin seeds, and turmeric are dry-roasted and stone-ground by hand in our kitchen every morning.
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center border-4 border-stone-900 shrink-0 z-10 md:-mx-4.5 journey-icon-spin">
                    02
                  </div>
                  <div className="flex-1 w-full rounded-2xl overflow-hidden h-40 border border-stone-850 shadow-md">
                    <img
                      src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80"
                      className="w-full h-full object-cover"
                      alt=""
                      onLoad={() => {
                        ScrollTrigger.refresh();
                      }}
                    />
                  </div>
                </div>

                {/* Stage 3: Steaming */}
                <div className="relative flex flex-col md:flex-row gap-6 md:gap-12 items-center journey-step-card opacity-30 transform translate-y-6 transition-all duration-700">
                  <div className="flex-1 text-left md:text-right">
                    <span className="text-[9px] font-black text-amber-500 tracking-widest uppercase block mb-1">Stage 03</span>
                    <h3 className="text-base font-extrabold text-stone-100">Artisan Steaming & Presentation</h3>
                    <p className="text-[11px] text-stone-400 mt-1 leading-relaxed">
                      Our chefs hand-pleat every dumpling, sealing the savory broth, before steaming them in traditional Nepalese bamboo baskets.
                    </p>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-amber-500 text-stone-950 font-black text-xs flex items-center justify-center border-4 border-stone-900 shrink-0 z-10 md:-mx-4.5 journey-icon-spin">
                    03
                  </div>
                  <div className="flex-1 w-full rounded-2xl overflow-hidden h-40 border border-stone-850 shadow-md">
                    <img
                      src="https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80"
                      className="w-full h-full object-cover"
                      alt=""
                      onLoad={() => {
                        ScrollTrigger.refresh();
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* TWO COLUMN INTERACTIVE MENU AREA */}
             <div className="flex flex-col lg:flex-row gap-8 items-start w-full mt-6">
              {/* LEFT INTERACTIVE COLUMN */}
              <div className="flex-1 flex flex-col gap-6 w-full">

                {/* SEARCH & FILTERS CONTROLS */}
                <div className="glass-panel rounded-[32px] p-5 flex flex-col md:flex-row gap-4 justify-between items-center border border-amber-500/10 shadow-xl scroll-reveal">
                <div className="relative w-full md:max-w-xs">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    placeholder="Search Momos, Noodles, Drinks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl glass-input text-xs font-semibold"
                  />
                </div>

                {/* Veg / Non-Veg Mode Toggle */}
                <div className="flex bg-stone-950 p-1.5 rounded-2xl border border-stone-850 gap-1 select-none">
                  {(['ALL', 'VEG', 'NON_VEG'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setVegFilter(mode)}
                      className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                        vegFilter === mode
                          ? mode === 'VEG'
                            ? 'bg-emerald-600 text-stone-100 shadow-md shadow-emerald-600/20'
                            : mode === 'NON_VEG'
                            ? 'bg-rose-700 text-stone-100 shadow-md shadow-rose-700/20'
                            : 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
                      }`}
                    >
                      {mode === 'ALL' && 'All Cuisines'}
                      {mode === 'VEG' && 'Veg Only'}
                      {mode === 'NON_VEG' && 'Non-Veg'}
                    </button>
                  ))}
                </div>

                {/* Kitchen Status Simulation Controller */}
                <div className="flex bg-stone-950 p-1.5 rounded-2xl border border-stone-850 gap-1 select-none">
                  {(['normal', 'busy', 'very_busy'] as const).map((load) => (
                    <button
                      key={load}
                      onClick={() => setKitchenLoad(load)}
                      className={`px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                        kitchenLoad === load
                          ? load === 'normal'
                            ? 'bg-emerald-600 text-stone-100 shadow-md shadow-emerald-600/20'
                            : load === 'busy'
                            ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                            : 'bg-rose-700 text-stone-100 shadow-md shadow-rose-700/20 animate-pulse'
                          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/40'
                      }`}
                    >
                      {load === 'normal' && 'Normal ETA'}
                      {load === 'busy' && 'Busy (+10m)'}
                      {load === 'very_busy' && 'Jammed (+20m)'}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
                  {mockCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-4 py-2 rounded-xl text-[10px] uppercase font-black whitespace-nowrap tracking-wider transition-all duration-300 ${
                        selectedCategory === cat
                          ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10'
                          : 'bg-stone-900/60 text-stone-400 hover:bg-stone-900 border border-stone-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Cuisine Filter Bar */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar border-t border-stone-850/40 pt-2.5">
                  {['All', 'Nepali', 'Newari', 'Sherpa', 'Chinese', 'Italian', 'American', 'Beverages'].map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedCuisine(c)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] uppercase font-black whitespace-nowrap tracking-wider transition-all duration-300 ${
                        selectedCuisine === c
                          ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/10'
                          : 'bg-stone-900/60 text-stone-400 hover:bg-stone-900 border border-stone-800'
                      }`}
                    >
                      {c === 'All' ? 'All Cuisines' : c}
                    </button>
                  ))}
                </div>
              </div>

              {/* 🎨 GUIDED PREFERENCE WIZARD */}
              <div className="bg-stone-900 border border-stone-850 rounded-[32px] overflow-hidden p-6 shadow-xl relative flex flex-col gap-4 scroll-reveal">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
                      <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-stone-100 uppercase tracking-wider">Guided Preference Wizard</h3>
                      <p className="text-[10px] text-stone-500 font-semibold mt-0.5">Customize your wrapper, diet, onion, and spice tolerance in our premium conversational onboarding flow</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsWizardOpen(true)}
                    className="text-[10px] font-black bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-center"
                  >
                    <Plus className="w-3.5 h-3.5 text-stone-950" /> Start Wizard
                  </button>
                </div>
              </div>

              {/* 🍛 TRADITIONAL THAKALI THALI BUILDER */}
              <div className="bg-stone-900 border border-stone-850 rounded-[32px] overflow-hidden p-6 shadow-xl relative flex flex-col gap-4 scroll-reveal">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shrink-0">
                      <Utensils className="w-5 h-5 text-amber-500 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-stone-100 uppercase tracking-wider">Traditional Thakali Thali Builder</h3>
                      <p className="text-[10px] text-stone-500 font-semibold mt-0.5">Customize your own authentic Nepalese Thali set with rice, dhido, and side curries</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsThaliBuilderOpen(true)}
                    className="text-[10px] font-black bg-amber-500 hover:bg-amber-600 text-stone-950 px-4 py-2.5 rounded-xl cursor-pointer transition-all shadow-md shadow-amber-500/10 flex items-center gap-1.5 shrink-0 self-stretch sm:self-auto justify-center"
                  >
                    <Plus className="w-3.5 h-3.5 text-stone-950" /> Build Your Thali
                  </button>
                </div>
              </div>

              {/* 👥 GROUP ORDERING PANEL */}
              <GroupOrderManager
                currentSession={groupSession}
                currentUser={currentUser}
                groupCart={groupCart}
                onStartSession={handleStartGroupSession}
                onJoinSession={handleJoinGroupSession}
                onLeaveSession={handleLeaveGroupSession}
                onAddParticipant={handleAddParticipant}
                onRemoveParticipant={handleRemoveParticipant}
                onSetSplitMethod={handleSetSplitMethod}
                onSwitchUser={handleSwitchUser}
              />

              {/* DISHES MENU EXPLORER GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredItems.map((item) => {
                  const currentSpice = selectedSpiceLevels[item.id] || getWizardDefaultSpice();
                  const qtyInCart = getItemQuantity(item.id, item.spiceOptions ? currentSpice : undefined);
                  const isSoldOut = item.isAvailable === false;
                  return (
                    <div
                      key={item.id}
                      className={`bg-stone-900 rounded-[32px] overflow-hidden flex flex-col min-h-[415px] pb-2 border ${getVegAccentClass()} shadow-md relative dish-scrub-card ${
                        isSoldOut ? 'opacity-60' : ''
                      }`}
                    >
                      {/* SOLD OUT STAMP COVER */}
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-stone-950/60 z-25 flex flex-col justify-center items-center backdrop-blur-[1px]">
                          <span className="bg-amber-500 text-stone-950 font-black uppercase text-[10px] tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-stone-850">
                            Sold Out Today
                          </span>
                        </div>
                      )}

                      <div className="relative h-48 overflow-hidden group border-b border-stone-850">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 dish-img-parallax"
                        />

                        {/* Veg/Non-Veg South Asian standard labeling icon */}
                        <div className="absolute top-3 right-3 z-30 bg-black/60 p-1 rounded-md border border-stone-800 flex items-center justify-center shadow-md">
                          <div className={`w-3 h-3 border-2 flex items-center justify-center p-[2px] ${item.isVeg ? 'border-emerald-500' : 'border-red-600'}`} title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
                            <div className={`w-1 h-1 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-red-600'}`} />
                          </div>
                        </div>
                        
                        {item.isPopular && !isSoldOut && (
                          <span className={`absolute top-3 left-3 ${getVegBadgeClass()} text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md transition-colors duration-300`}>
                            <Sparkles className="w-2.5 h-2.5 fill-current" /> Popular
                          </span>
                        )}

                        <span className={`absolute bottom-3 right-3 ${getVegBadgeClass()} text-xs font-black px-2.5 py-1 rounded-xl shadow-lg border border-amber-500/10 transition-colors duration-300`}>
                          Rs. {item.price}
                        </span>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between bg-transparent">
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h3 className="font-extrabold text-stone-100 text-base leading-tight truncate">{item.name}</h3>
                            <span className="text-[9px] text-stone-700 bg-stone-850 border border-stone-800 px-2.5 py-0.5 rounded-full font-black tracking-wider uppercase">
                              {item.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {item.spiceOptions && !isSoldOut && (
                          <div className="flex items-center justify-between bg-stone-950/45 border border-stone-850/40 px-3 py-1.5 rounded-xl my-2">
                            <span className="text-[9px] text-stone-400 font-extrabold uppercase tracking-wider">Spice:</span>
                            <div className="flex gap-1 select-none">
                              {(['Mild', 'Medium', 'Hot'] as const).map((spice) => {
                                const isSelected = currentSpice === spice;
                                return (
                                  <button
                                    key={spice}
                                    onClick={() => setSelectedSpiceLevels((prev) => ({ ...prev, [item.id]: spice }))}
                                    className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                      isSelected
                                        ? spice === 'Hot'
                                          ? 'bg-rose-700 text-stone-100 shadow-sm'
                                          : spice === 'Medium'
                                          ? 'bg-amber-500 text-stone-950 shadow-sm'
                                          : 'bg-emerald-600 text-stone-100 shadow-sm'
                                        : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900/20'
                                    }`}
                                  >
                                    {spice}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between border-t border-stone-850 pt-3">
                          {(() => {
                            const eta = getKitchenETADetails(item.prepTime);
                            return (
                              <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1 shadow-sm transition-all duration-300 ${eta.badgeClass}`}>
                                <Clock className={`w-3 h-3 ${eta.iconColor}`} /> {eta.label}
                              </span>
                            );
                          })()}

                          {!isSoldOut && (
                            qtyInCart > 0 ? (
                              <div className="flex items-center gap-2 bg-stone-950 p-1.5 rounded-xl border border-stone-850">
                                <button
                                  onClick={() => updateCartQuantity(item.id, -1, item.spiceOptions ? currentSpice : undefined)}
                                  className="w-5.5 h-5.5 rounded-lg bg-stone-900 hover:bg-stone-850 flex items-center justify-center text-amber-500 transition-colors"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className={`text-xs font-black text-stone-400 w-4 text-center cohesive-transition ${pulsingItemId === item.id ? 'scale-130 text-amber-500' : 'scale-100'}`}>{qtyInCart}</span>
                                <button
                                  onClick={() => updateCartQuantity(item.id, 1, item.spiceOptions ? currentSpice : undefined)}
                                  className="w-5.5 h-5.5 rounded-lg bg-stone-900 hover:bg-stone-850 flex items-center justify-center text-amber-500 transition-colors"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={(e) => addToCart(item, e, item.spiceOptions ? currentSpice : undefined)}
                                className={`magnetic-btn px-4 py-2 ${getVegBadgeClass()} hover:opacity-90 rounded-full text-[10px] uppercase tracking-wider font-extrabold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer`}
                              >
                                <Plus className="w-3.5 h-3.5 text-current" /> Add To Cart
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredItems.length === 0 && (
                  <div className="col-span-full glass-panel rounded-[32px] p-12 text-center border border-amber-500/5">
                    <p className="text-stone-500 text-xs">No items found matching your filters.</p>
                  </div>
                )}
              </div>

              {/* SAVED DESTINATIONS PANEL */}
              <div className="glass-panel rounded-[32px] p-6 flex flex-col border border-amber-500/10 shadow-2xl justify-between min-h-[220px]">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <h3 className="font-extrabold text-stone-100 text-xs uppercase tracking-wider">
                      Saved Destinations
                    </h3>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 mb-2.5 max-h-[120px] no-scrollbar">
                  {customer?.addresses?.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAddressId(a.id)}
                      className={`p-3 rounded-2xl border text-left text-xs transition-all flex justify-between items-center ${
                        selectedAddressId === a.id && deliveryType === 'DELIVERY'
                          ? 'bg-amber-500/10 border-amber-500 text-stone-200'
                          : 'bg-black/20 border-stone-850 hover:border-stone-700 text-stone-400'
                      }`}
                      disabled={deliveryType === 'PICKUP'}
                    >
                      <div>
                        <strong className="block text-stone-200 font-extrabold uppercase text-[9px] tracking-wider mb-0.5">
                          {a.label}
                        </strong>
                        <span className="truncate block max-w-[240px]">{a.address}</span>
                      </div>
                      {selectedAddressId === a.id && deliveryType === 'DELIVERY' && <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />}
                    </button>
                  ))}
                  {(!customer || !customer.addresses || customer.addresses.length === 0) && (
                    <span className="text-[11px] text-stone-500 block py-2">Please register or log in to manage saved addresses.</span>
                  )}
                </div>

                {customer && !showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full py-2 bg-stone-900 hover:bg-stone-850 text-stone-300 rounded-xl text-xs font-bold transition-all border border-stone-800 flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-500" /> Add Saved Location
                  </button>
                )}

                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="flex flex-col gap-2 bg-black/45 p-3 rounded-2xl border border-stone-800">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        placeholder="Label (e.g. Home, Work)"
                        value={newAddressLabel}
                        onChange={(e) => setNewAddressLabel(e.target.value)}
                        className="col-span-3 px-2.5 py-1.5 text-xs rounded-lg glass-input focus:outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Province"
                        value={newAddressProvince}
                        onChange={(e) => setNewAddressProvince(e.target.value)}
                        className="col-span-1 px-2.5 py-1.5 text-xs rounded-lg glass-input focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="District"
                        value={newAddressDistrict}
                        onChange={(e) => setNewAddressDistrict(e.target.value)}
                        className="col-span-2 px-2.5 py-1.5 text-xs rounded-lg glass-input focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Ward / Muni"
                        value={newAddressWard}
                        onChange={(e) => setNewAddressWard(e.target.value)}
                        className="col-span-1 px-2.5 py-1.5 text-xs rounded-lg glass-input focus:outline-none"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Landmark (Near ...)"
                        value={newAddressLandmark}
                        onChange={(e) => setNewAddressLandmark(e.target.value)}
                        className="col-span-2 px-2.5 py-1.5 text-xs rounded-lg glass-input focus:outline-none"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-black text-[10px] uppercase rounded-lg shadow cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddressForm(false)}
                        className="px-3 py-1.5 bg-stone-800 text-stone-300 text-[10px] rounded-lg cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* RIGHT SIDEBAR: CHECKOUT BASKET */}
            <aside className="w-full lg:w-[380px] xl:w-[415px] min-w-[320px] md:min-w-[365px] shrink-0 lg:sticky lg:top-24">
              <div
                className={`glass-panel rounded-[32px] p-6 border transition-all duration-300 shadow-2xl flex flex-col justify-between min-h-[580px] scroll-reveal ${
                  cartPulse ? 'border-amber-500 bg-amber-500/5' : 'border-amber-500/10'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-5 border-b border-stone-900 pb-3">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-amber-500" />
                      <h3 className="font-extrabold text-stone-100 uppercase tracking-wider text-sm">Checkout Basket</h3>
                    </div>
                    <span className="text-[10px] font-black bg-stone-900 border border-stone-850 px-2.5 py-0.5 rounded text-amber-500">
                      {cart.reduce((sum, item) => sum + item.quantity, 0)} Items
                    </span>
                  </div>

                  {/* Delivery vs Pickup Selector */}
                  <div className="grid grid-cols-2 gap-2 bg-black/40 border border-stone-900 p-0.5 rounded-xl text-xs font-bold mb-4">
                    <button
                      onClick={() => setDeliveryType('DELIVERY')}
                      className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                        deliveryType === 'DELIVERY' ? 'bg-amber-500 text-black' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" /> Delivery
                    </button>
                    <button
                      onClick={() => setDeliveryType('PICKUP')}
                      className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
                        deliveryType === 'PICKUP' ? 'bg-amber-500 text-black' : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" /> Pickup (Self)
                    </button>
                  </div>

                  {/* Cart Items list */}
                  <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1 no-scrollbar mb-4">
                    {(groupSession ? (groupCart as CartDisplayItem[]) : (cart as CartDisplayItem[])).map((item: CartDisplayItem) => (
                      <div
                        key={groupSession ? `${item.menuItem.id}-${item.spiceLevel || 'None'}-${item.participant}` : `${item.menuItem.id}-${item.spiceLevel || 'None'}`}
                        className={`flex justify-between items-center bg-black/25 p-3 rounded-2xl border border-stone-900 cohesive-transition overflow-hidden ${
                          isClearingCart ? 'opacity-0 scale-95 max-h-0 py-0 border-0' : 'min-h-[70px] max-h-[220px]'
                        }`}
                      >
                        <div className="min-w-0 pr-2 flex-1">
                          {groupSession && (
                            <span className="text-[7.5px] bg-stone-900 border border-stone-850 px-1.5 py-0.5 rounded text-stone-400 font-bold uppercase tracking-wider mb-1 block w-max">
                              👤 {item.participant}
                            </span>
                          )}
                          <h4 className="text-xs font-extrabold text-stone-200 break-words whitespace-normal leading-tight">{item.menuItem.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-amber-500 font-semibold">Rs. {item.menuItem.price}</span>
                            {item.spiceLevel && (
                              <span className={`text-[7px] font-black uppercase px-1 py-0.2 rounded ${
                                item.spiceLevel === 'Hot' 
                                  ? 'bg-rose-900/40 text-rose-400 border border-rose-800/30' 
                                  : item.spiceLevel === 'Medium'
                                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                                  : 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/30'
                              }`}>
                                🌶️ {item.spiceLevel}
                              </span>
                            )}
                          </div>
                          {item.customThali && (
                            <div className="text-[8.5px] text-stone-400 mt-1.5 space-y-0.5 bg-stone-950/40 p-1.5 rounded-lg border border-stone-850/50">
                              <div className="font-extrabold text-[8px] text-amber-500 uppercase tracking-wider mb-0.5">Thali Selection:</div>
                              <div>• Base: {item.customThali.base.name}</div>
                              <div>• Curries: {item.customThali.curries.map((c) => c.name).join(', ')}</div>
                              <div>• Achar: {item.customThali.achar.name}</div>
                              {item.customThali.extras.length > 0 && (
                                <div>• Extras: {item.customThali.extras.map((e) => e.name).join(', ')}</div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => updateCartQuantity(item.menuItem.id, -1, item.spiceLevel, item.participant)}
                            className="w-5.5 h-5.5 rounded-lg bg-stone-900 hover:bg-stone-850 flex items-center justify-center text-amber-500 transition-colors"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className={`text-xs font-black text-stone-200 w-4 text-center cohesive-transition ${pulsingItemId === item.menuItem.id ? 'scale-130 text-amber-500' : 'scale-100'}`}>{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.menuItem.id, 1, item.spiceLevel, item.participant)}
                            className="w-5.5 h-5.5 rounded-lg bg-stone-900 hover:bg-stone-850 flex items-center justify-center text-amber-500 transition-colors"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {(groupSession ? groupCart.length === 0 : cart.length === 0) && (
                      <div className="text-center py-10 flex flex-col items-center gap-2">
                        <ShoppingBag className="w-8 h-8 text-stone-700" />
                        <p className="text-stone-500 text-xs font-semibold">Your basket is empty.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Billing summary and Checkout actions */}
                <div className="border-t border-stone-900 pt-4 flex flex-col gap-4 mt-auto">
                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex justify-between font-semibold text-stone-400">
                      <span>Items Subtotal</span>
                      <span>Rs. {cartSubtotal}</span>
                    </div>

                    <div className="flex justify-between font-semibold text-stone-400">
                      <span>
                        {deliveryType === 'PICKUP' ? 'Self-Pickup' : 'Standard Delivery'}
                      </span>
                      <span>
                        {deliveryType === 'PICKUP' ? 'Rs. 0' : (isEligibleFreeDelivery ? 'FREE' : `Rs. ${selectedRestaurant.deliveryFee}`)}
                      </span>
                    </div>

                    {/* Minimum order notice */}
                    {!isMinimumOrderMet && cart.length > 0 && (
                      <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-center mt-1">
                        Minimum Order Rs. 200 Required
                      </div>
                    )}

                    <div className="flex justify-between font-black text-amber-500 text-sm border-t border-stone-900 pt-2.5 mt-1">
                      <span>Estimated Total</span>
                      <span>Rs. {cartTotal}</span>
                    </div>
                  </div>

                  {cart.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <label className="block text-[9px] font-black uppercase text-amber-500 tracking-wider">
                        Select Payment Method
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        <button
                          onClick={() => setPaymentMethod('CASH_ON_DELIVERY')}
                          className={`py-2 rounded-xl text-[8.5px] font-black tracking-wider uppercase transition-all border ${
                            paymentMethod === 'CASH_ON_DELIVERY'
                              ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-md'
                              : 'bg-black/30 border-stone-850 text-stone-450 hover:border-stone-750'
                          }`}
                        >
                          COD
                        </button>
                        <button
                          onClick={() => setPaymentMethod('ESEWA')}
                          className={`py-2 rounded-xl text-[8.5px] font-black tracking-wider uppercase transition-all border ${
                            paymentMethod === 'ESEWA'
                              ? 'bg-[#60bb46]/15 border-[#60bb46] text-[#60bb46] shadow-md'
                              : 'bg-black/30 border-stone-850 text-stone-450 hover:border-stone-750'
                          }`}
                        >
                          eSewa
                        </button>
                        <button
                          onClick={() => setPaymentMethod('KHALTI')}
                          className={`py-2 rounded-xl text-[8.5px] font-black tracking-wider uppercase transition-all border ${
                            paymentMethod === 'KHALTI'
                              ? 'bg-[#5c2d91]/15 border-[#5c2d91] text-[#5c2d91] shadow-md'
                              : 'bg-black/30 border-stone-850 text-stone-450 hover:border-stone-750'
                          }`}
                        >
                          Khalti
                        </button>
                        <button
                          onClick={() => setPaymentMethod('BANK_TRANSFER')}
                          className={`py-2 rounded-xl text-[8.5px] font-black tracking-wider uppercase transition-all border ${
                            paymentMethod === 'BANK_TRANSFER'
                              ? 'bg-amber-500/15 border-amber-500 text-amber-500 shadow-md'
                              : 'bg-black/30 border-stone-850 text-stone-450 hover:border-stone-750'
                          }`}
                        >
                          Bank
                        </button>
                      </div>
                    </div>
                  )}

                  {customer ? (
                    <button
                      onClick={handleCheckout}
                      disabled={cart.length === 0 || checkoutLoading || !isMinimumOrderMet}
                      className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-black text-xs font-black tracking-wider uppercase rounded-2xl shadow-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Order & Checkout'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowRegModal(true)}
                      className="w-full py-3.5 bg-stone-900 hover:bg-stone-850 text-stone-300 text-xs font-black tracking-wider uppercase rounded-2xl border border-stone-800 transition-colors cursor-pointer"
                    >
                      Register Account to Order
                    </button>
                  )}

                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="w-full mt-2.5 py-2 text-stone-700 hover:text-stone-900 hover:underline text-[10px] font-black tracking-widest uppercase transition-colors cursor-pointer text-center bg-transparent border-0 outline-none flex items-center justify-center gap-1"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      )}
      </main>

      {/* FOOTER WIDGET: ABOUT & CONTACT INFO */}
      <footer className="border-t border-stone-850 bg-stone-900 mt-16 py-12 text-stone-600 text-xs scroll-reveal">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 leading-relaxed">
          <div className="flex flex-col gap-2">
            <h4 className="text-stone-400 font-extrabold uppercase text-xs tracking-wider">About Tasty Bites</h4>
            <p className="max-w-sm">
              We are Kathmandu&apos;s premiere single-kitchen restaurant platform. We deliver hot culinary recipes directly from our chefs to your table within minutes.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-stone-400 font-extrabold uppercase text-xs tracking-wider">Kitchen Hours & Location</h4>
            <p>📍 Durbar Marg, Kathmandu, Nepal</p>
            <p>⏰ Open Daily: 10:00 AM - 10:00 PM</p>
            <p>🚀 Delivery Area: Within 5km radius of Durbar Marg</p>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-stone-400 font-extrabold uppercase text-xs tracking-wider">Contact & Support</h4>
            <p>📞 Phone: +977-1-4221122</p>
            <p>📧 Support: hello@tastybites.com.np</p>
            <p className="text-[10px] text-stone-500 mt-2">© 2026 Tasty Bites Kitchen. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* REGISTRATION MODAL */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-stone-900 border border-stone-850 p-8 rounded-[32px] w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowRegModal(false)}
              className="absolute top-4 right-4 text-stone-450 hover:text-amber-500 font-bold transition-colors cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-2xl font-black serif-title text-stone-400 tracking-tight mb-2">Create Customer Account</h2>
            <p className="text-stone-700 text-xs mb-6 leading-relaxed">
              Join Kathmandu&apos;s premium kitchen. Save your delivery destinations and track orders live.
            </p>

            <form onSubmit={handleRegister} className="flex flex-col gap-4 text-xs font-semibold">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-amber-500 mb-1.5 font-black">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Ram Bahadur"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-850 text-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-amber-500 mb-1.5 font-black">Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="98XXXXXXXX"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-850 text-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-amber-500 mb-1.5 font-black">Primary Address (Kathmandu)</label>
                <input
                  type="text"
                  required
                  placeholder="New Road, Kathmandu"
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-stone-950 border border-stone-850 text-stone-400 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black uppercase tracking-wider rounded-full shadow-lg transition-colors cursor-pointer mt-4 flex items-center justify-center gap-1.5"
              >
                {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Register Account'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SIMULATED ONLINE GATEWAY MODAL */}
      {simulatedGateway && (
        <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex justify-center items-center p-4">
          <div className="bg-stone-950 border border-stone-850 p-8 rounded-[36px] w-full max-w-sm text-center shadow-2xl relative">
            <div className="flex justify-center mb-6">
              {simulatedGateway === 'ESEWA' ? (
                <div className="px-6 py-3 bg-[#60bb46] text-white rounded-2xl font-black text-xl tracking-wider select-none shadow-lg">
                  eSewa
                </div>
              ) : (
                <div className="px-6 py-3 bg-[#5c2d91] text-white rounded-2xl font-black text-xl tracking-wider select-none shadow-lg">
                  Khalti
                </div>
              )}
            </div>

            <h3 className="text-stone-400 font-extrabold text-base mb-2">Simulating Gateway Payment</h3>
            <p className="text-stone-700 text-xs mb-6">
              Contacting secure sandbox validation server... Please do not close this window.
            </p>

            {/* Loader bar */}
            <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full transition-all duration-500 ${
                  simulatedGateway === 'ESEWA' ? 'bg-[#60bb46]' : 'bg-[#5c2d91]'
                }`}
                style={{ width: `${gatewayProgress}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-stone-600 uppercase tracking-widest">{gatewayProgress}% Secured</span>
          </div>
        </div>
      )}
      {/* THALI BUILDER MODAL */}
      <ThaliBuilder
        isOpen={isThaliBuilderOpen}
        onClose={() => setIsThaliBuilderOpen(false)}
        onAddThali={handleAddCustomThali}
      />
      {/* CULINARY PREFERENCE WIZARD MODAL */}
      <PreferenceWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onConfirm={handleWizardConfirm}
      />
    </div>
  );
}
