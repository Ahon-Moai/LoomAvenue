export interface Offer {
  id: string;
  title: string;
  quantity: number;
  discountPercentage?: number;
  fixedDiscount?: number;
  badgeText?: string;
  badgeColor?: string;
  freeShipping?: boolean;
}

export interface Product {
  id: string;
  name: string;
  tagline?: string;
  price: number;
  originalPrice?: number;
  category: string;
  collection?: string;
  description: string;
  details?: string[];
  imageUrl: string;
  stock?: number;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  materials?: string;
  story?: string;
  features?: string[];
  additionalImages?: string[];
  offers?: Offer[];
}

export interface OrderItem {
  id?: string;
  name?: string;
  productName?: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  imageUrl?: string;
  selectedOfferName?: string;
  discountApplied?: number;
  originalTotal?: number;
  finalPaidAmount?: number;
  savings?: number;
  freeShipping?: boolean;
  bundleSelections?: any[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedOffer?: Offer;
  bundleSelections?: (Product | string)[];
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress: string;
  transactionId?: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  total: number;
  shippingFee: number;
  items: OrderItem[];
}

export interface Collection {
  id: string;
  title?: string;
  name?: string;
  subtitle?: string;
  slug?: string;
  tagline?: string;
  description?: string;
  videoUrl?: string;
  imageUrl?: string;
}

export interface CollectionInfo {
  id: string;
  title?: string;
  name?: string;
  subtitle?: string;
  slug?: string;
  tagline?: string;
  description?: string;
  videoUrl?: string;
  imageUrl?: string;
}
