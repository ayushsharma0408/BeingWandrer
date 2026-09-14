export const POPULAR_ROUTES = [
  {
    origin: 'CCU',
    destination: 'BOM',
    label: 'Kolkata → Mumbai',
    tone: 'dest-mumbai',
    image: '/destinations/mumbai.jpg',
  },
  {
    origin: 'DEL',
    destination: 'BOM',
    label: 'Delhi → Mumbai',
    tone: 'dest-delhi',
    image: '/destinations/delhi.jpg',
  },
  {
    origin: 'BOM',
    destination: 'GOI',
    label: 'Mumbai → Goa',
    tone: 'dest-goa',
    image: '/destinations/goa.jpg',
  },
  {
    origin: 'DEL',
    destination: 'DXB',
    label: 'Delhi → Dubai',
    tone: 'dest-dubai',
    image: '/destinations/dubai.jpg',
  },
] as const;

export { cityFor } from '../lib/airport-catalog';
