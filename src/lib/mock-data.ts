import type { Product, Order } from './types';

export const PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: '1000 Diamonds',
    game: 'Mobile Legends',
    price: 9.99,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'fantasy battle',
    stock: 100,
  },
  {
    id: 'prod_2',
    name: '500 UC',
    game: 'PUBG Mobile',
    price: 7.99,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'soldier battleground',
    stock: 100,
  },
  {
    id: 'prod_3',
    name: 'Valorant Points 1200',
    game: 'Valorant',
    price: 10.0,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'sci-fi shooter',
    stock: 100,
  },
  {
    id: 'prod_4',
    name: '800 Genesis Crystals',
    game: 'Genshin Impact',
    price: 14.99,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'anime adventure',
    stock: 100,
  },
    {
    id: 'prod_5',
    name: '1050 Wild Cores',
    game: 'League of Legends: Wild Rift',
    price: 9.99,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'mobile MOBA',
    stock: 100,
  },
  {
    id: 'prod_6',
    name: '2200 CP',
    game: 'Call of Duty: Mobile',
    price: 19.99,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'modern warfare',
    stock: 100,
  },
  {
    id: 'prod_7',
    name: '1000 Apex Coins',
    game: 'Apex Legends',
    price: 9.99,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'futuristic legends',
    stock: 100,
  },
  {
    id: 'prod_8',
    name: 'Fortnite V-Bucks 1000',
    game: 'Fortnite',
    price: 8.99,
    imageUrl: 'https://placehold.co/600x400.png',
    dataAiHint: 'cartoon battle',
    stock: 100,
  },
];

export const MOCK_ORDERS: Order[] = [
    {
        id: 'ORDER-1A2B3C',
        date: '2023-10-26T10:00:00Z',
        total: 29.98,
        items: [
            {...PRODUCTS[2], quantity: 2},
            {...PRODUCTS[0], quantity: 1}
        ]
    },
    {
        id: 'ORDER-4D5E6F',
        date: '2023-09-15T14:30:00Z',
        total: 14.99,
        items: [
            {...PRODUCTS[3], quantity: 1}
        ]
    }
];
