import { Restaurant, MenuItem } from '../types/food';

export const mockRestaurants: Restaurant[] = [
  {
    id: 'rest-tasty-bites',
    name: 'Tasty Bites - Nepalese Cuisines',
    cuisine: 'Momo, Chowmein, Nepalese',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&auto=format&fit=crop&q=80',
    prepTime: '15-20 min',
    deliveryFee: 50,
    menu: [
      {
        id: 1,
        restaurantId: 'rest-tasty-bites',
        name: 'Chicken Momo',
        price: 150,
        category: 'Appetizers',
        image: 'https://images.unsplash.com/photo-1625220194771-7ebedd0b4869?w=600&auto=format&fit=crop&q=80',
        description: 'Juicy minced chicken dumplings seasoned with Nepalese herbs, served with spicy tomato chutney.',
        isPopular: true,
        prepTime: '15-20 min',
        isVeg: false,
        spiceOptions: true,
        ingredients: ['Chicken meat', 'Ginger-garlic', 'Onions', 'Cilantro', 'House momo spice blend'],
        allergens: ['Gluten'],
        moods: ['Celebrating', 'Comfort Food']
      },
      {
        id: 2,
        restaurantId: 'rest-tasty-bites',
        name: 'Veg Momo',
        price: 120,
        category: 'Appetizers',
        image: 'https://images.unsplash.com/photo-1626804475315-9644b37a2fe4?w=600&auto=format&fit=crop&q=80',
        description: 'Fresh finely chopped vegetables packed inside a thin wrapper, steamed to perfection.',
        prepTime: '15-20 min',
        isVeg: true,
        spiceOptions: true,
        ingredients: ['Cabbage', 'Carrots', 'Mushroom', 'Soy sauce', 'Scallions'],
        allergens: ['Gluten', 'Soy'],
        moods: ['Feeling Healthy', 'Comfort Food']
      },
      {
        id: 3,
        restaurantId: 'rest-tasty-bites',
        name: 'Chicken Chowmein',
        price: 140,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
        description: 'Stir-fried noodles with succulent chicken pieces, crunchy cabbage, carrots, and Nepalese spices.',
        isPopular: true,
        prepTime: '10-15 min',
        isVeg: false,
        spiceOptions: true,
        ingredients: ['Stir-fried wheat noodles', 'Succulent chicken pieces', 'Shredded cabbage', 'Carrots', 'Dark soy sauce'],
        allergens: ['Gluten', 'Soy'],
        moods: ['Comfort Food', 'Feeling Lazy']
      },
      {
        id: 4,
        restaurantId: 'rest-tasty-bites',
        name: 'Veg Chowmein',
        price: 110,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600&auto=format&fit=crop&q=80',
        description: 'Delicious stir-fried noodles loaded with seasonal mixed vegetables and savory soy seasoning.',
        prepTime: '10-15 min',
        isVeg: true,
        spiceOptions: true,
        ingredients: ['Wheat noodles', 'Bell peppers', 'Cabbage', 'Carrots', 'Onions', 'Light soy sauce'],
        allergens: ['Gluten', 'Soy'],
        moods: ['Feeling Healthy', 'Comfort Food']
      },
      {
        id: 10,
        restaurantId: 'rest-tasty-bites',
        name: 'Lassi',
        price: 80,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
        description: 'Creamy yogurt drink blended with sweet mango pulp, milk, sugar, and topped with dry fruits.',
        isPopular: true,
        prepTime: '3-5 min',
        isVeg: true,
        spiceOptions: false,
        ingredients: ['Yogurt', 'Sweet mango pulp', 'Milk', 'Sugar', 'Dry nuts'],
        allergens: ['Dairy', 'Nuts'],
        moods: ['Feeling Lazy']
      }
    ]
  },
  {
    id: 'rest-momo-hub',
    name: 'The Momo Hub & Pizzeria',
    cuisine: 'Pizza, Burgers, Fast Food',
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    prepTime: '18-22 min',
    deliveryFee: 60,
    menu: [
      {
        id: 5,
        restaurantId: 'rest-momo-hub',
        name: 'Chicken Burger',
        price: 180,
        category: 'Fast Food',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        description: 'Crispy chicken patty layered with melted cheese, fresh lettuce, tomatoes, and house mayonnaise.',
        isPopular: true,
        prepTime: '10-12 min',
        isVeg: false,
        spiceOptions: false,
        ingredients: ['Chicken patty', 'Toasted sesame buns', 'Cheese slice', 'Lettuce', 'Mayo'],
        allergens: ['Gluten', 'Dairy'],
        moods: ['Comfort Food', 'Celebrating']
      },
      {
        id: 6,
        restaurantId: 'rest-momo-hub',
        name: 'Veg Burger',
        price: 150,
        category: 'Fast Food',
        image: 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=600&auto=format&fit=crop&q=80',
        description: 'Golden spiced potato-veg patty with onions, pickles, cheese, and spicy tangy burger sauce.',
        prepTime: '10-12 min',
        isVeg: true,
        spiceOptions: false,
        ingredients: ['Spiced potato patty', 'Buns', 'Onions', 'Pickles', 'Cheese', 'House sauce'],
        allergens: ['Gluten', 'Dairy'],
        moods: ['Comfort Food']
      },
      {
        id: 7,
        restaurantId: 'rest-momo-hub',
        name: 'Margherita Pizza',
        price: 280,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&auto=format&fit=crop&q=80',
        description: 'Classic thin-crust pizza topped with rich Italian marinara sauce, fresh basil, and mozzarella cheese.',
        prepTime: '15-20 min',
        isVeg: true,
        spiceOptions: false,
        ingredients: ['Thin-crust dough', 'Marinara sauce', 'Mozzarella', 'Fresh basil', 'Olive oil'],
        allergens: ['Gluten', 'Dairy'],
        moods: ['Celebrating', 'Comfort Food']
      },
      {
        id: 8,
        restaurantId: 'rest-momo-hub',
        name: 'Chicken Pizza',
        price: 350,
        category: 'Pizza',
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
        description: 'Crisp hand-tossed base loaded with roasted chicken cubes, bell peppers, red onions, and cheese.',
        isPopular: true,
        prepTime: '18-22 min',
        isVeg: false,
        spiceOptions: false,
        ingredients: ['Hand-tossed base', 'Roasted chicken cubes', 'Bell peppers', 'Red onions', 'Cheese'],
        allergens: ['Gluten', 'Dairy'],
        moods: ['Celebrating']
      },
      {
        id: 9,
        restaurantId: 'rest-momo-hub',
        name: 'Coke',
        price: 60,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1581636622953-1ab5b06f52cc?w=600&auto=format&fit=crop&q=80',
        description: 'Chilled, refreshing classic Coca-Cola can to go along with your hot momos.',
        prepTime: '2-3 min',
        isVeg: true,
        spiceOptions: false,
        ingredients: ['Coca-Cola carbonate syrup', 'Purified water'],
        allergens: [],
        moods: ['Feeling Lazy']
      }
    ]
  },
  {
    id: 'rest-quick-bites',
    name: 'Kathmandu Express Fast Food',
    cuisine: 'Burgers, Fries, Fried Chicken',
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    prepTime: '10-15 min',
    deliveryFee: 40,
    menu: [
      {
        id: 11,
        restaurantId: 'rest-quick-bites',
        name: 'Chicken Burger',
        price: 180,
        category: 'Fast Food',
        image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
        description: 'Juicy chicken patty, fresh lettuce, cheddar cheese, and house mayo on a toasted bun.',
        isPopular: true,
        prepTime: '10-12 min',
        isVeg: false,
        spiceOptions: false,
        ingredients: ['Chicken patty', 'Sesame buns', 'Cheddar cheese', 'Lettuce', 'Mayo'],
        allergens: ['Gluten', 'Dairy'],
        moods: ['Comfort Food']
      },
      {
        id: 12,
        restaurantId: 'rest-quick-bites',
        name: 'Crispy French Fries',
        price: 90,
        category: 'Fast Food',
        image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600&auto=format&fit=crop&q=80',
        description: 'Golden-brown, salted skin-on potatoes served with traditional dip sauce.',
        prepTime: '5-8 min',
        isVeg: true,
        spiceOptions: false,
        ingredients: ['Skin-on potatoes', 'Refined oil', 'Salt'],
        allergens: [],
        moods: ['Comfort Food', 'Feeling Lazy']
      },
      {
        id: 13,
        restaurantId: 'rest-quick-bites',
        name: 'Fried Chicken Wings',
        price: 220,
        category: 'Fast Food',
        image: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
        description: 'Spicy seasoned crispy wings tossed in house hot sauce, perfect side delight.',
        isPopular: true,
        prepTime: '12-15 min',
        isVeg: false,
        spiceOptions: true,
        ingredients: ['Chicken wings', 'Crispy batter', 'House hot chili sauce'],
        allergens: ['Gluten'],
        moods: ['Celebrating', 'Comfort Food']
      }
    ]
  },
  {
    id: 'rest-sweet-sips',
    name: 'Himalayan Nectar & Sweets',
    cuisine: 'Beverages, Lassi, Desserts',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
    prepTime: '5-10 min',
    deliveryFee: 30,
    menu: [
      {
        id: 14,
        restaurantId: 'rest-sweet-sips',
        name: 'Sweet Mango Lassi',
        price: 80,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
        description: 'Thick, creamy yogurt drink blended with fresh sweet organic mangoes from Janakpur.',
        isPopular: true,
        prepTime: '3-5 min',
        isVeg: true,
        spiceOptions: false,
        ingredients: ['Yogurt', 'Sweet mango pulp', 'Milk', 'Cardamom powder'],
        allergens: ['Dairy'],
        moods: ['Comfort Food', 'Feeling Healthy']
      },
      {
        id: 15,
        restaurantId: 'rest-sweet-sips',
        name: 'Fresh Mango Juice',
        price: 100,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1534080391025-a87b99805702?w=600&auto=format&fit=crop&q=80',
        description: 'Chilled freshly squeezed sweet mango juice pulp, highly refreshing.',
        prepTime: '3-5 min',
        isVeg: true,
        spiceOptions: false,
        ingredients: ['Organic mango pulp', 'Ice cubes', 'Sugar syrup'],
        allergens: [],
        moods: ['Feeling Healthy']
      },
      {
        id: 16,
        restaurantId: 'rest-sweet-sips',
        name: 'Classic Coke',
        price: 60,
        category: 'Beverages',
        image: 'https://images.unsplash.com/photo-1581636622953-1ab5b06f52cc?w=600&auto=format&fit=crop&q=80',
        description: 'Chilled classic Coca-Cola can to wash down your heavy momo meals.',
        prepTime: '2-3 min',
        isVeg: true,
        spiceOptions: false,
        ingredients: ['Classic Coca-Cola can'],
        allergens: [],
        moods: ['Feeling Lazy']
      }
    ]
  },
  {
    id: 'rest-thakali-ghar',
    name: 'Thakali Kitchen & Traditional Ghar',
    cuisine: 'Thakali Thali, Nepalese, Local',
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    prepTime: '20-25 min',
    deliveryFee: 50,
    menu: [
      {
        id: 17,
        restaurantId: 'rest-thakali-ghar',
        name: 'Veg Thakali Thali',
        price: 280,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        description: 'Authentic Nepali rice thali with local lentils, seasonal vegetable curries, spinach, pickle, and ghee.',
        isPopular: true,
        prepTime: '15-20 min',
        isVeg: true,
        spiceOptions: true,
        ingredients: ['Steamed Basmati Rice', 'Black Lentil soup (Dal)', 'Spiced mustard greens', 'Gundruk Pickle', 'Clarified butter (Ghee)'],
        allergens: ['Dairy'],
        moods: ['Comfort Food', 'Feeling Healthy']
      },
      {
        id: 18,
        restaurantId: 'rest-thakali-ghar',
        name: 'Chicken Thakali Thali',
        price: 350,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80',
        description: 'Traditional Thakali meal set featuring steamed basmati rice, local chicken curry, gundruk pickle, and salad.',
        isPopular: true,
        prepTime: '20-22 min',
        isVeg: false,
        spiceOptions: true,
        ingredients: ['Steamed Rice', 'Black Lentil soup', 'Local Chicken curry', 'Gundruk pickle', 'Tomato achar'],
        allergens: ['Dairy'],
        moods: ['Comfort Food']
      },
      {
        id: 19,
        restaurantId: 'rest-thakali-ghar',
        name: 'Mutton Thakali Thali',
        price: 420,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
        description: 'Rich Hilly-spiced tender mutton curry served alongside premium basmati rice, clarified butter, and side picklings.',
        prepTime: '22-25 min',
        isVeg: false,
        spiceOptions: true,
        ingredients: ['Basmati rice', 'Slow-cooked local mutton curry', 'Dal', 'Seasonal vegetables', 'Gundruk achar'],
        allergens: ['Dairy'],
        moods: ['Celebrating', 'Comfort Food']
      }
    ]
  },
  {
    id: 'rest-newa-lahana',
    name: 'Newa Lahana traditional kitchen',
    cuisine: 'Newari Cuisines, Choila, Bara, Chatamari',
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80',
    prepTime: '15-20 min',
    deliveryFee: 40,
    menu: [
      {
        id: 20,
        restaurantId: 'rest-newa-lahana',
        name: 'Buff Choila Set',
        price: 160,
        category: 'Appetizers',
        image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=600&auto=format&fit=crop&q=80',
        description: 'Authentic spiced grilled buffalo meat tossed in mustard oil, garlic, ginger, and fenugreek seeds.',
        isPopular: true,
        prepTime: '12-15 min',
        isVeg: false,
        spiceOptions: true,
        ingredients: ['Grilled buffalo meat', 'Fenugreek seeds', 'Mustard oil', 'Green garlic', 'Himalayan spices'],
        allergens: [],
        moods: ['Celebrating', 'Comfort Food']
      },
      {
        id: 21,
        restaurantId: 'rest-newa-lahana',
        name: 'Egg Chatamari',
        price: 120,
        category: 'Appetizers',
        image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=600&auto=format&fit=crop&q=80',
        description: 'Traditional Nepalese rice crepe topped with egg, minced chicken, and local herbs.',
        prepTime: '10-12 min',
        isVeg: false,
        spiceOptions: true,
        ingredients: ['Rice batter crepe', 'Cracked organic egg', 'Minced chicken', 'Fresh coriander'],
        allergens: ['Egg'],
        moods: ['Comfort Food']
      }
    ]
  },
  {
    id: 'rest-sherpa-house',
    name: 'The Sherpa Dumpling House',
    cuisine: 'Sherpa Cuisines, Thenthuk, Shyabhale',
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80',
    prepTime: '18-22 min',
    deliveryFee: 45,
    menu: [
      {
        id: 22,
        restaurantId: 'rest-sherpa-house',
        name: 'Chicken Thenthuk',
        price: 180,
        category: 'Main Course',
        image: 'https://images.unsplash.com/photo-1541832676-9b763b0239ab?w=600&auto=format&fit=crop&q=80',
        description: 'Sherpa-style hand-pulled flat noodle soup with chicken cubes, fresh radish, and spinach.',
        isPopular: true,
        prepTime: '15-18 min',
        isVeg: false,
        spiceOptions: true,
        ingredients: ['Hand-pulled flat wheat noodles', 'Chicken pieces', 'Sliced radish', 'Spinach', 'Broth'],
        allergens: ['Gluten'],
        moods: ['Comfort Food', 'Feeling Healthy']
      },
      {
        id: 23,
        restaurantId: 'rest-sherpa-house',
        name: 'Buff Shyabhale',
        price: 150,
        category: 'Appetizers',
        image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&auto=format&fit=crop&q=80',
        description: 'Deep-fried pocket bread stuffed with spiced minced meat, served with hot chili chutney.',
        prepTime: '12-15 min',
        isVeg: false,
        spiceOptions: true,
        ingredients: ['Fried bread pastry', 'Minced buffalo meat', 'Garlic', 'Chili paste'],
        allergens: ['Gluten'],
        moods: ['Comfort Food']
      }
    ]
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

// Dynamically assign cuisine fields to all menu items based on their properties
mockRestaurants.forEach(r => {
  r.menu.forEach(item => {
    if (!item.cuisine) {
      const name = item.name.toLowerCase();
      if (item.category === 'Beverages') {
        item.cuisine = 'Beverages';
      } else if (name.includes('momo')) {
        item.cuisine = 'Nepali';
      } else if (name.includes('thali') || name.includes('dhido')) {
        item.cuisine = 'Nepali';
      } else if (name.includes('choila') || name.includes('bara') || name.includes('chatamari')) {
        item.cuisine = 'Newari';
      } else if (name.includes('thenthuk') || name.includes('shyabhale')) {
        item.cuisine = 'Sherpa';
      } else if (item.category === 'Pizza') {
        item.cuisine = 'Italian';
      } else if (item.category === 'Fast Food' || name.includes('burger') || name.includes('fries') || name.includes('sandwich')) {
        item.cuisine = 'American';
      } else {
        // Fallback matching by restaurant properties
        if (r.id === 'rest-thakali-ghar') {
          item.cuisine = 'Nepali';
        } else if (r.id === 'rest-newa-lahana') {
          item.cuisine = 'Newari';
        } else if (r.id === 'rest-sherpa-house') {
          item.cuisine = 'Sherpa';
        } else {
          item.cuisine = 'Nepali';
        }
      }
    }
  });
});

export const mockMenuItems: MenuItem[] = mockRestaurants.flatMap(r => r.menu);
