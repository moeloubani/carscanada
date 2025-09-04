// Car-related constants
export const CAR_MAKES = [
  'Acura',
  'Alfa Romeo',
  'Aston Martin',
  'Audi',
  'Bentley',
  'BMW',
  'Buick',
  'Cadillac',
  'Chevrolet',
  'Chrysler',
  'Dodge',
  'Ferrari',
  'Fiat',
  'Ford',
  'Genesis',
  'GMC',
  'Honda',
  'Hyundai',
  'Infiniti',
  'Jaguar',
  'Jeep',
  'Kia',
  'Lamborghini',
  'Land Rover',
  'Lexus',
  'Lincoln',
  'Lotus',
  'Maserati',
  'Mazda',
  'McLaren',
  'Mercedes-Benz',
  'Mini',
  'Mitsubishi',
  'Nissan',
  'Porsche',
  'Ram',
  'Rolls-Royce',
  'Subaru',
  'Tesla',
  'Toyota',
  'Volkswagen',
  'Volvo',
] as const;

export type CarMake = typeof CAR_MAKES[number];

// Popular models by make (subset for common searches)
export const CAR_MODELS: Record<string, string[]> = {
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'HR-V', 'Odyssey', 'Ridgeline'],
  'Toyota': ['Camry', 'Corolla', 'RAV4', 'Highlander', 'Tacoma', 'Tundra', '4Runner', 'Prius'],
  'Ford': ['F-150', 'F-250', 'F-350', 'Explorer', 'Escape', 'Edge', 'Mustang', 'Bronco', 'Ranger'],
  'Chevrolet': ['Silverado', 'Tahoe', 'Suburban', 'Equinox', 'Traverse', 'Malibu', 'Camaro', 'Corvette'],
  'Nissan': ['Altima', 'Sentra', 'Rogue', 'Murano', 'Pathfinder', 'Frontier', 'Titan', 'Maxima'],
  'Mazda': ['Mazda3', 'CX-5', 'CX-30', 'CX-50', 'CX-9', 'MX-5 Miata'],
  'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Venue'],
  'Kia': ['Forte', 'K5', 'Seltos', 'Sportage', 'Sorento', 'Telluride', 'Carnival'],
  'Volkswagen': ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf', 'ID.4', 'Taos'],
  'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'Crosstrek', 'Ascent', 'WRX', 'BRZ'],
  'BMW': ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7', 'M3', 'M5'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'A-Class', 'G-Class'],
  'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
  'Lexus': ['IS', 'ES', 'GS', 'LS', 'NX', 'RX', 'GX', 'LX'],
  'Acura': ['ILX', 'TLX', 'RDX', 'MDX', 'NSX', 'Integra'],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y', 'Cybertruck'],
  'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Grand Wagoneer'],
  'Ram': ['1500', '2500', '3500', 'ProMaster'],
  'GMC': ['Sierra', 'Yukon', 'Terrain', 'Acadia', 'Canyon', 'Hummer EV'],
  'Dodge': ['Charger', 'Challenger', 'Durango', 'Journey', 'Grand Caravan'],
};

export const BODY_TYPES = [
  'Sedan',
  'SUV',
  'Truck',
  'Coupe',
  'Convertible',
  'Hatchback',
  'Wagon',
  'Van',
  'Minivan',
  'Crossover',
  'Sports Car',
  'Luxury',
  'Electric',
  'Hybrid',
  'Diesel',
] as const;

export type BodyType = typeof BODY_TYPES[number];

export const FUEL_TYPES = [
  'Gasoline',
  'Diesel',
  'Electric',
  'Hybrid',
  'Plug-in Hybrid',
  'Hydrogen',
  'Flex Fuel',
] as const;

export type FuelType = typeof FUEL_TYPES[number];

export const TRANSMISSION_TYPES = [
  'Manual',
  'Automatic',
  'CVT',
  'Dual-Clutch',
  'Single-Speed',
] as const;

export type TransmissionType = typeof TRANSMISSION_TYPES[number];

export const DRIVETRAIN_TYPES = [
  'FWD',
  'RWD',
  'AWD',
  '4WD',
] as const;

export type DrivetrainType = typeof DRIVETRAIN_TYPES[number];

export const COLORS = [
  'Black',
  'White',
  'Silver',
  'Gray',
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Orange',
  'Brown',
  'Beige',
  'Gold',
  'Purple',
  'Other',
] as const;

export type Color = typeof COLORS[number];

export const CONDITIONS = [
  'New',
  'Like New',
  'Excellent',
  'Good',
  'Fair',
  'Salvage',
] as const;

export type Condition = typeof CONDITIONS[number];

// Location constants
export const PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
] as const;

export const MAJOR_CITIES = {
  'ON': ['Toronto', 'Ottawa', 'Mississauga', 'Hamilton', 'Brampton', 'London', 'Markham', 'Vaughan', 'Kitchener', 'Windsor'],
  'QC': ['Montreal', 'Quebec City', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke', 'Saguenay', 'Levis', 'Trois-Rivieres'],
  'BC': ['Vancouver', 'Surrey', 'Burnaby', 'Richmond', 'Abbotsford', 'Coquitlam', 'Kelowna', 'Victoria', 'Kamloops', 'Nanaimo'],
  'AB': ['Calgary', 'Edmonton', 'Red Deer', 'Lethbridge', 'St. Albert', 'Medicine Hat', 'Grande Prairie', 'Airdrie', 'Spruce Grove'],
  'MB': ['Winnipeg', 'Brandon', 'Steinbach', 'Thompson', 'Portage la Prairie', 'Winkler', 'Selkirk', 'Morden', 'Dauphin'],
  'SK': ['Saskatoon', 'Regina', 'Prince Albert', 'Moose Jaw', 'Swift Current', 'Yorkton', 'North Battleford', 'Estevan', 'Weyburn'],
  'NS': ['Halifax', 'Cape Breton', 'Dartmouth', 'Sydney', 'Truro', 'New Glasgow', 'Glace Bay', 'Kentville', 'Amherst'],
  'NB': ['Moncton', 'Saint John', 'Fredericton', 'Dieppe', 'Miramichi', 'Edmundston', 'Campbellton', 'Oromocto', 'Bathurst'],
  'NL': ["St. John's", 'Mount Pearl', 'Corner Brook', 'Conception Bay South', 'Grand Falls-Windsor', 'Paradise', 'Happy Valley-Goose Bay'],
  'PE': ['Charlottetown', 'Summerside', 'Stratford', 'Cornwall', 'Montague', 'Kensington', 'Souris', 'Alberton'],
  'NT': ['Yellowknife', 'Hay River', 'Inuvik', 'Fort Smith', 'Behchoko', 'Fort Simpson', 'Tuktoyaktuk'],
  'YT': ['Whitehorse', 'Dawson City', 'Watson Lake', 'Haines Junction', 'Carmacks', 'Mayo', 'Faro'],
  'NU': ['Iqaluit', 'Rankin Inlet', 'Arviat', 'Baker Lake', 'Cambridge Bay', 'Igloolik', 'Kugluktuk'],
};

// Price ranges for filters
export const PRICE_RANGES = [
  { label: 'Under $5,000', min: 0, max: 5000 },
  { label: '$5,000 - $10,000', min: 5000, max: 10000 },
  { label: '$10,000 - $15,000', min: 10000, max: 15000 },
  { label: '$15,000 - $20,000', min: 15000, max: 20000 },
  { label: '$20,000 - $25,000', min: 20000, max: 25000 },
  { label: '$25,000 - $30,000', min: 25000, max: 30000 },
  { label: '$30,000 - $40,000', min: 30000, max: 40000 },
  { label: '$40,000 - $50,000', min: 40000, max: 50000 },
  { label: '$50,000 - $75,000', min: 50000, max: 75000 },
  { label: '$75,000 - $100,000', min: 75000, max: 100000 },
  { label: 'Over $100,000', min: 100000, max: undefined },
] as const;

// Year ranges
export const currentYear = new Date().getFullYear();
export const YEAR_RANGES = Array.from(
  { length: currentYear - 1979 },
  (_, i) => currentYear - i
);

// Mileage ranges for filters
export const MILEAGE_RANGES = [
  { label: 'Under 10,000 km', min: 0, max: 10000 },
  { label: '10,000 - 25,000 km', min: 10000, max: 25000 },
  { label: '25,000 - 50,000 km', min: 25000, max: 50000 },
  { label: '50,000 - 75,000 km', min: 50000, max: 75000 },
  { label: '75,000 - 100,000 km', min: 75000, max: 100000 },
  { label: '100,000 - 150,000 km', min: 100000, max: 150000 },
  { label: '150,000 - 200,000 km', min: 150000, max: 200000 },
  { label: 'Over 200,000 km', min: 200000, max: undefined },
] as const;

// Sort options for listings
export const SORT_OPTIONS = [
  { label: 'Newest First', value: 'createdAt_desc' },
  { label: 'Oldest First', value: 'createdAt_asc' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Mileage: Low to High', value: 'mileage_asc' },
  { label: 'Mileage: High to Low', value: 'mileage_desc' },
  { label: 'Year: Newest First', value: 'year_desc' },
  { label: 'Year: Oldest First', value: 'year_asc' },
] as const;

// Features list
export const CAR_FEATURES = {
  'Safety': [
    'ABS',
    'Airbags',
    'Backup Camera',
    'Blind Spot Monitoring',
    'Lane Departure Warning',
    'Adaptive Cruise Control',
    'Emergency Braking',
    'Parking Sensors',
    'Traction Control',
    'Stability Control',
  ],
  'Comfort': [
    'Air Conditioning',
    'Climate Control',
    'Heated Seats',
    'Ventilated Seats',
    'Leather Seats',
    'Power Seats',
    'Memory Seats',
    'Heated Steering Wheel',
    'Sunroof',
    'Panoramic Roof',
  ],
  'Technology': [
    'Navigation System',
    'Bluetooth',
    'Apple CarPlay',
    'Android Auto',
    'Premium Sound System',
    'Wireless Charging',
    'Head-up Display',
    'Digital Dashboard',
    'WiFi Hotspot',
    'USB Ports',
  ],
  'Performance': [
    'Turbo',
    'Supercharged',
    'Sport Mode',
    'All-Wheel Drive',
    '4-Wheel Drive',
    'Limited Slip Differential',
    'Performance Exhaust',
    'Performance Brakes',
    'Adaptive Suspension',
    'Launch Control',
  ],
  'Convenience': [
    'Keyless Entry',
    'Push Button Start',
    'Remote Start',
    'Power Liftgate',
    'Hands-Free Liftgate',
    'Power Windows',
    'Power Locks',
    'Cruise Control',
    'Auto-dimming Mirrors',
    'Rain Sensing Wipers',
  ],
};

// Dealer subscription plans
export const SUBSCRIPTION_PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: 0,
    interval: 'month',
    features: [
      'Up to 5 active listings',
      'Basic analytics',
      'Email support',
      'Standard visibility',
    ],
    limits: {
      listings: 5,
      featuredListings: 0,
      photos: 10,
      prioritySupport: false,
    },
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 99,
    interval: 'month',
    features: [
      'Up to 25 active listings',
      'Advanced analytics',
      'Priority support',
      'Featured dealer badge',
      '2 featured listings/month',
      'Enhanced visibility',
    ],
    limits: {
      listings: 25,
      featuredListings: 2,
      photos: 25,
      prioritySupport: true,
    },
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 299,
    interval: 'month',
    features: [
      'Unlimited listings',
      'Premium analytics & insights',
      '24/7 phone support',
      'Premium dealer badge',
      '10 featured listings/month',
      'Maximum visibility',
      'API access',
      'Lead generation tools',
    ],
    limits: {
      listings: -1, // unlimited
      featuredListings: 10,
      photos: 50,
      prioritySupport: true,
    },
  },
] as const;

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_EMAIL: '/auth/verify-email',
  
  // User
  USER_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  CHANGE_PASSWORD: '/users/change-password',
  USER_LISTINGS: '/users/listings',
  USER_FAVORITES: '/users/favorites',
  USER_SEARCHES: '/users/searches',
  
  // Listings
  LISTINGS: '/listings',
  LISTING_DETAIL: (id: string) => `/listings/${id}`,
  CREATE_LISTING: '/listings',
  UPDATE_LISTING: (id: string) => `/listings/${id}`,
  DELETE_LISTING: (id: string) => `/listings/${id}`,
  FEATURE_LISTING: (id: string) => `/listings/${id}/feature`,
  
  // Search
  SEARCH_LISTINGS: '/listings/search',
  SAVE_SEARCH: '/searches',
  DELETE_SEARCH: (id: string) => `/searches/${id}`,
  
  // Favorites
  ADD_FAVORITE: (listingId: string) => `/favorites/${listingId}`,
  REMOVE_FAVORITE: (listingId: string) => `/favorites/${listingId}`,
  
  // Messages
  CONVERSATIONS: '/messages/conversations',
  CONVERSATION: (id: string) => `/messages/conversations/${id}`,
  SEND_MESSAGE: '/messages',
  
  // Dealers
  DEALERS: '/dealers',
  DEALER_DETAIL: (id: string) => `/dealers/${id}`,
  DEALER_LISTINGS: (id: string) => `/dealers/${id}/listings`,
  DEALER_REVIEWS: (id: string) => `/dealers/${id}/reviews`,
  
  // Reviews
  CREATE_REVIEW: '/reviews',
  UPDATE_REVIEW: (id: string) => `/reviews/${id}`,
  DELETE_REVIEW: (id: string) => `/reviews/${id}`,
  
  // Subscriptions
  SUBSCRIPTIONS: '/subscriptions',
  CREATE_SUBSCRIPTION: '/subscriptions',
  CANCEL_SUBSCRIPTION: (id: string) => `/subscriptions/${id}/cancel`,
  
  // Reports
  VEHICLE_HISTORY: (vin: string) => `/reports/vehicle-history/${vin}`,
  MARKET_ANALYSIS: '/reports/market-analysis',
  
  // Upload
  UPLOAD_IMAGE: '/upload/image',
  DELETE_IMAGE: (id: string) => `/upload/image/${id}`,
  
  // Payments
  FEATURED_PACKAGES: '/payments/packages',
  CREATE_CHECKOUT_SESSION: '/payments/checkout',
  CONFIRM_PAYMENT: '/payments/confirm',
  PAYMENT_HISTORY: '/payments/history',
  ACTIVE_FEATURES: '/payments/active-features',
} as const;

// WebSocket events
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Messages
  NEW_MESSAGE: 'new_message',
  MESSAGE_READ: 'message_read',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop',
  
  // Notifications
  NEW_NOTIFICATION: 'new_notification',
  NOTIFICATION_READ: 'notification_read',
  
  // Listings
  LISTING_VIEW: 'listing_view',
  LISTING_UPDATE: 'listing_update',
  PRICE_DROP: 'price_drop',
  
  // User presence
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// Map settings
export const DEFAULT_MAP_CENTER = {
  lat: 56.1304, // Center of Canada
  lng: -106.3468,
};

export const DEFAULT_MAP_ZOOM = 4;

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const MAX_IMAGES_PER_LISTING = 20;

// Featured Packages
export const FEATURED_PACKAGES = [
  {
    id: 'basic',
    name: 'Basic',
    duration: 7,
    price: 29.99,
    features: [
      'Featured for 7 days',
      'Highlighted in search results',
      'Priority in listings',
      'Featured badge',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    duration: 14,
    price: 49.99,
    originalPrice: 59.98,
    popular: true,
    features: [
      'Featured for 14 days',
      'Highlighted in search results',
      'Priority in listings',
      'Featured badge',
      'Homepage showcase',
      '2x more views',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    duration: 30,
    price: 89.99,
    originalPrice: 119.97,
    features: [
      'Featured for 30 days',
      'Highlighted in search results',
      'Top priority in listings',
      'Premium featured badge',
      'Homepage showcase',
      '5x more views',
      'Social media promotion',
      'Email blast inclusion',
    ],
  },
] as const;

// Form validation messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email address',
  PHONE_INVALID: 'Please enter a valid phone number',
  POSTAL_CODE_INVALID: 'Please enter a valid postal code',
  PASSWORD_MIN_LENGTH: 'Password must be at least 8 characters',
  PASSWORD_MISMATCH: 'Passwords do not match',
  PRICE_INVALID: 'Please enter a valid price',
  YEAR_INVALID: 'Please enter a valid year',
  MILEAGE_INVALID: 'Please enter a valid mileage',
  VIN_INVALID: 'Please enter a valid VIN',
} as const;