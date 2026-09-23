export interface Product {
  id: string;
  name: string;
  tagline: string;
  price: number;
  originalPrice?: number;
  category: string;
  collection: string;
  description: string;
  details: string[];
  imageUrl: string;
  stock: number;
  sizes?: string[];
  colors?: string[];
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  imageUrl?: string;
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

export interface CollectionInfo {
  id: string;
  title: string;
  subtitle: string;
  videoUrl?: string;
  imageUrl?: string;
}
