import { MenuItem } from '../types/food';

export const mockMenuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Chicken Momo',
    price: 150,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
    description: 'Juicy minced chicken dumplings seasoned with Nepalese herbs, served with spicy tomato chutney.',
    isPopular: true,
    prepTime: '15-20 min'
  },
  {
    id: 2,
    name: 'Veg Momo',
    price: 120,
    category: 'Appetizers',
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80',
    description: 'Fresh finely chopped vegetables packed inside a thin wrapper, steamed to perfection.',
    prepTime: '15-20 min'
  },
  {
    id: 3,
    name: 'Chicken Chowmein',
    price: 140,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
    description: 'Stir-fried noodles with succulent chicken pieces, crunchy cabbage, carrots, and Nepalese spices.',
    isPopular: true,
    prepTime: '10-15 min'
  },
  {
    id: 4,
    name: 'Veg Chowmein',
    price: 110,
    category: 'Main Course',
    image: 'https://images.unsplash.com/photo-1612966608963-47da317790dd?w=600&auto=format&fit=crop&q=80',
    description: 'Delicious stir-fried noodles loaded with seasonal mixed vegetables and savory soy seasoning.',
    prepTime: '10-15 min'
  },
  {
    id: 5,
    name: 'Chicken Burger',
    price: 180,
    category: 'Fast Food',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    description: 'Crispy chicken patty layered with melted cheese, fresh lettuce, tomatoes, and house mayonnaise.',
    isPopular: true,
    prepTime: '10-12 min'
  },
  {
    id: 6,
    name: 'Veg Burger',
    price: 150,
    category: 'Fast Food',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&auto=format&fit=crop&q=80',
    description: 'Golden spiced potato-veg patty with onions, pickles, cheese, and spicy tangy burger sauce.',
    prepTime: '10-12 min'
  },
  {
    id: 7,
    name: 'Margherita Pizza',
    price: 280,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&auto=format&fit=crop&q=80',
    description: 'Classic thin-crust pizza topped with rich Italian marinara sauce, fresh basil, and mozzarella cheese.',
    prepTime: '15-20 min'
  },
  {
    id: 8,
    name: 'Chicken Pizza',
    price: 350,
    category: 'Pizza',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    description: 'Crisp hand-tossed base loaded with roasted chicken cubes, bell peppers, red onions, and cheese.',
    isPopular: true,
    prepTime: '18-22 min'
  },
  {
    id: 9,
    name: 'Coke',
    price: 60,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80',
    description: 'Chilled, refreshing classic Coca-Cola can to go along with your hot momos.',
    prepTime: '2-3 min'
  },
  {
    id: 10,
    name: 'Lassi',
    price: 80,
    category: 'Beverages',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
    description: 'Creamy yogurt drink blended with sweet mango pulp, milk, sugar, and topped with dry fruits.',
    isPopular: true,
    prepTime: '3-5 min'
  }
];

export const mockCategories = [
  'All',
  'Appetizers',
  'Main Course',
  'Fast Food',
  'Pizza',
  'Beverages'
];
