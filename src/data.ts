import { Product, Collection } from './types';

export const collections: Collection[] = [
  {
    id: 'col-1',
    name: 'LOOM AVENUE CAPS',
    slug: 'worn-textiles',
    description: 'Meticulously sourced premium fabrics, perfected through strict quality control. Investing in a cap means securing a flawless win.',
    tagline: 'Wear it, live it, own it.',
    imageUrl: 'https://ik.imagekit.io/t1q0n1ovm/WhatsApp%20Image%202026-07-14%20at%2023.26.55(1).jpeg?tr=w-800,f-auto,q-auto',
    videoUrl: 'https://res.cloudinary.com/deyatjand/video/upload/f_mp4,q_auto,vc_h264,ac_none,w_1920,c_limit/v1782572836/IMG_2439_lnghj5.mp4'
  },
  {
    id: 'col-2',
    name: 'NEW ERA MASTERCOPY CAPS',
    slug: 'earth-clay',
    description: 'Crafted with premium imported materials that rival and often surpass the originals. Loved by a growing community of international buyers who recognize pure quality. Secure yours and feel the upgrade.',
    tagline: 'Earthy, coarse, and timeless.',
    imageUrl: 'https://ik.imagekit.io/t1q0n1ovm/WhatsApp%20Image%202026-06-17%20at%2023.40.37.jpeg?tr=w-800,f-auto,q-auto',
    videoUrl: 'https://ik.imagekit.io/t1q0n1ovm/WhatsApp%20Video%202026-06-16%20at%2022.36.54(1).mp4'
  }
];

export const products: Product[] = [
  {
    id: 'prd-1',
    name: 'Wabi-Sabi Raw Linen Shirt',
    price: 84.00,
    description: 'An oversized relaxed-cut shirt made from organic unbleached linen. Features raw unfinished hems, drop-shoulders, and organic coconut shell buttons. The weave is intentionally visible and imperfect.',
    imageUrl: '/src/assets/images/lofi_linen_shirt_1781445685810.jpg',
    category: 'worn-textiles',
    sizes: ['S', 'M', 'L', 'XL'],
    materials: '100% GOTS Organic Unbleached Flax Linen',
    story: 'Designed with a dropped silhouette and deliberate raw edges that will fray slightly over time with use and wash, giving a unique, personalized character to each wearer.',
    features: [
      'Raw, gently frayed collar and hem detail',
      'Naturally cooling heavy flax weave',
      'Hand-sewn coconut shell buttons',
      'Pre-washed with volcanic stones for softness'
    ],
    inStock: true,
    offers: [
      {
        id: 'off-1-1',
        title: 'GET 2 SHIRTS 15% OFF',
        quantity: 2,
        discountPercentage: 15,
        freeShipping: false,
        badgeText: 'MOST POPULAR 🔥',
        badgeColor: 'bg-black text-white',
        highlightColor: 'bg-red-500 text-white'
      },
      {
        id: 'off-1-2',
        title: 'GET 3 SHIRTS 30% OFF',
        quantity: 3,
        discountPercentage: 30,
        freeShipping: true,
        badgeText: 'EXCLUSIVE DEAL',
        badgeColor: 'bg-black text-white',
        highlightColor: 'bg-red-500 text-white'
      }
    ]
  },
  {
    id: 'prd-2',
    name: 'Sage Dust Utility Jacket',
    price: 135.00,
    description: 'A structured utility jacket tailored from heavy-duty organic duck cotton. Garment-dyed using plant extract to achieve a dusty sage-olive tone that patinas dynamically at the seams with every wear.',
    imageUrl: '/src/assets/images/lofi_utility_jacket_1781445701310.jpg',
    category: 'worn-textiles',
    sizes: ['S', 'M', 'L', 'XL'],
    materials: '12oz Heavy Organic Cotton Canvas',
    story: 'Inspired by traditional Japanese chore coats, this piece acts as armor for creative life. Reinforced double-stitching ensures durability for years of evolution.',
    features: [
      'Four deep external utility pocket compartments',
      'Earthy tone achieved via organic indigo and marigold brew',
      'Subtle distressed edges for lived-in comfort',
      'Adjustable wrist cuffs'
    ],
    inStock: true
  },
  {
    id: 'prd-3',
    name: 'Speckled Oatmeal Stoneware Vase',
    price: 52.00,
    description: 'A wood-fired ceramic vessel hand-turned in our small studio. Leaves a portion of the raw textured iron-speckled dark clay exposed at the base, topped with a fluid, satin-matte oatmeal glaze.',
    imageUrl: '/src/assets/images/lofi_ceramic_pot_1781445716748.jpg',
    category: 'earth-clay',
    sizes: ['One Size'],
    materials: 'Iron-speckled local stoneware clay, organic glaze',
    story: 'Every vase goes through a 24-hour firing cycle in an anaerobic kiln. The unpredictable flames create dark blemishes and birthmarks that make each piece absolutely flawed and singular.',
    features: [
      'Individually hand-thrown on the kickwheel',
      'Unique flame-kissed blemishes and iron spotting',
      'Watertight interior glaze for fresh botanicals',
      'Subtle stamped maker stamp on bottom rim'
    ],
    inStock: true
  },
  {
    id: 'prd-5',
    name: 'New Era',
    price: 28.00,
    description: 'An elongated hand-carved clay dish textured to resemble river bedrock. Includes a shallow depression that catches ashes gently and a custom-drilled brass incense stand.',
    imageUrl: 'https://res.cloudinary.com/deyatjand/image/upload/f_auto,q_auto/v1782924448/52273ddd-c1b5-45a0-b04b-702f4fc25807.png',
    category: 'earth-clay',
    sizes: ['One Size'],
    materials: 'Raw terracotta clay, solid raw brass insert',
    story: 'Formed from natural clay beds, each dish is stamped by local riverbed pebbles, leaving an impression of flow and calm transition.',
    features: [
      'Removable solid brass core that patinas nicely',
      'Generous length prevents ash from escaping',
      'Underside finished with soft cork protection'
    ],
    inStock: true
  },
  {
    id: 'prd-6',
    name: 'LoomAvenue',
    price: 90.00,
    description: 'Double-gauze relaxed lounge trousers featuring a soft and light crinkled texture. Designed with a flexible drawstring waistband, deep utility pockets, and a wide-leg cut.',
    imageUrl: 'https://res.cloudinary.com/deyatjand/image/upload/f_auto,q_auto/v1782924586/a29a51d3-ae0e-4657-99ff-0e77e555807c.png',
    category: 'worn-textiles',
    sizes: ['S', 'M', 'L', 'XL'],
    materials: '100% Organic Double-Gauze Cotton',
    story: 'A tribute to slow living. Wear it in the early morning, through creative studio sessions, or for evening wind-downs. It is designed to never require ironing, celebrating natural wrinkles.',
    features: [
      'Elastic adjustable waistband with braided linen drawcord',
      'Pre-washed and pre-shrunk',
      'Lightweight yet completely opaque structure',
      'Breathes beautifully in hot humid weather'
    ],
    inStock: true
  }
];
