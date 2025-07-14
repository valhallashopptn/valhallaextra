import type { Product, Order } from './types';

// NOTE: Product data is now managed in Firebase Firestore.
// This is kept for reference or future use.
export const PRODUCTS: Product[] = [];

export const MOCK_ORDERS: Order[] = [
    {
        id: 'ORDER-1A2B3C',
        date: '2023-10-26T10:00:00Z',
        total: 29.98,
        items: [
            {
                id: 'prod_3',
                name: 'Valorant Points 1200',
                game: 'Valorant',
                price: 10.0,
                imageUrl: 'https://placehold.co/600x400.png',
                dataAiHint: 'sci-fi shooter',
                stock: 100,
                quantity: 2
            },
            {
                id: 'prod_1',
                name: '1000 Diamonds',
                game: 'Mobile Legends',
                price: 9.99,
                imageUrl: 'https://placehold.co/600x400.png',
                dataAiHint: 'fantasy battle',
                stock: 100,
                quantity: 1
            }
        ]
    },
    {
        id: 'ORDER-4D5E6F',
        date: '2023-09-15T14:30:00Z',
        total: 14.99,
        items: [
             {
                id: 'prod_4',
                name: '800 Genesis Crystals',
                game: 'Genshin Impact',
                price: 14.99,
                imageUrl: 'https://placehold.co/600x400.png',
                dataAiHint: 'anime adventure',
                stock: 100,
                quantity: 1
            },
        ]
    }
];
