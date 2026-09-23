import { Product, CollectionInfo } from './types';

export const COLLECTIONS: CollectionInfo[] = [
  {
    id: 'wabi-sabi',
    title: 'Wabi-Sabi Autumn',
    subtitle: 'Textured natural linens & relaxed organic silhouettes',
    videoUrl: 'https://ik.imagekit.io/g03uyzcgy/the-hidden-ivy-cafe-moewalls-com.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 'botanical-heritage',
    title: 'Botanical Heritage',
    subtitle: 'Hand-dyed earth pigments & studio pottery',
    videoUrl: 'https://ik.imagekit.io/g03uyzcgy/the-hidden-ivy-cafe-moewalls-com.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'prod-linen-shirt',
    name: 'Raw Linen Overshirt',
    tagline: 'Handwoven French flax with drop shoulder cut',
    price: 135,
    originalPrice: 160,
    category: 'Apparel',
    collection: 'wabi-sabi',
    description: 'Constructed from heavy gauge 280gsm pure washed European flax. Naturally breathable, tactile texture that softens gracefully with every wear.',
    details: ['100% Organic European Linen', 'Corozo nut natural buttons', 'Relaxed unisex oversized drape', 'Pre-washed for tactile texture'],
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=800&auto=format&fit=crop',
    stock: 14,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Earthy Khaki', 'Unbleached Oatmeal', 'Slate Ash']
  },
  {
    id: 'prod-utility-jacket',
    name: 'Atelier Utility Field Coat',
    tagline: 'Structured cotton canvas with deep bellows pockets',
    price: 210,
    originalPrice: 245,
    category: 'Outerwear',
    collection: 'wabi-sabi',
    description: 'Designed for daily durability and understated elegance. Hand-finished seams with triple needle reinforcement and interior passport pocket.',
    details: ['14oz Japanese milled cotton canvas', 'Hidden brass storm placket', 'Deep utility flap pockets', 'Adjustable cuff tabs'],
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?q=80&w=800&auto=format&fit=crop',
    stock: 8,
    sizes: ['M', 'L', 'XL'],
    colors: ['Umber Brown', 'Midnight Charcoal']
  },
  {
    id: 'prod-canvas-tote',
    name: 'Heavy Twill Canvas Tote',
    tagline: 'Reinforced saddle leather straps & brass rivets',
    price: 78,
    category: 'Accessories',
    collection: 'wabi-sabi',
    description: 'A daily carry built to endure. Features an internal organizer sleeve suited for a 15-inch laptop, solid copper rivets, and full-grain bridle leather handles.',
    details: ['Heavyweight 18oz duck canvas', 'Vegetable-tanned leather handles', 'Internal dual sleeve divider', 'Key lanyard snap clip'],
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=800&auto=format&fit=crop',
    stock: 22,
    colors: ['Natural Sand', 'Moss Olive', 'Black Onyx']
  },
  {
    id: 'prod-ceramic-pot',
    name: 'Studio Matte Ceramic Vessel',
    tagline: 'Wheel-thrown stoneware with coarse volcanic speckle',
    price: 65,
    category: 'Living',
    collection: 'botanical-heritage',
    description: 'Individual hand-thrown ceramic vessel crafted by local artisans. Finished in an unglazed raw exterior and a satin-white waterproof interior glaze.',
    details: ['Local stoneware clay blend', 'Food and water safe interior', 'Each piece possesses unique hand-thrown variations', 'Signed at the base by maker'],
    imageUrl: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=800&auto=format&fit=crop',
    stock: 11,
    colors: ['Raw Terracotta', 'Sandstone White']
  },
  {
    id: 'prod-pleated-trouser',
    name: 'Wide-Leg Pleated Chino',
    tagline: 'High-rise tailored silhouette with relaxed leg taper',
    price: 155,
    category: 'Apparel',
    collection: 'wabi-sabi',
    description: 'Inspired by mid-century workwear, cut with a comfortable deep double pleat that falls into a gentle taper at the ankle.',
    details: ['100% Dense combed cotton twill', 'Double reverse front pleats', 'Internal waist drawstring adjustment', 'Horn button fly'],
    imageUrl: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=800&auto=format&fit=crop',
    stock: 19,
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Desert Khaki', 'Washed Olive']
  }
];
