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
}

export interface AudioTrack {
  id: string;
  title: string;
  url: string;
  author: string;
}
