/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

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
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline: string;
  imageUrl?: string;
}

export interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
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
