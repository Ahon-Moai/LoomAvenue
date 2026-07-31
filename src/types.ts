/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Offer {
  id: string;
  title: string;
  quantity: number;
  discountPercentage?: number;
  fixedDiscount?: number;
  badgeText?: string;
  badgeColor?: string;
  highlightColor?: string;
  freeShipping: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  additionalImages?: string[];
  category: string;
  sizes: string[];
  materials: string;
  story: string;
  features: string[];
  inStock: boolean;
  offers?: Offer[];
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
  selectedOffer?: Offer;
  bundleSelections?: Product[];
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline: string;
  imageUrl?: string;
  videoUrl?: string;
}

export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  selectedOfferName?: string;
  discountApplied?: number;
  originalTotal?: number;
  finalPaidAmount?: number;
  savings?: number;
  freeShipping?: boolean;
  bundleSelections?: string[];
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAddress?: string;
  transactionId?: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  total: number;
  items: OrderItem[];
}

export interface AudioTrack {
  id: string;
  title: string;
  url: string;
  author: string;
}
