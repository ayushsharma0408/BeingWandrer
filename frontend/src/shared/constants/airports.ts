export const POPULAR_ROUTES = [
  { origin: 'CCU', destination: 'BOM', label: 'Kolkata → Mumbai', tone: 'dest-mumbai' },
  { origin: 'DEL', destination: 'BOM', label: 'Delhi → Mumbai', tone: 'dest-delhi' },
  { origin: 'BOM', destination: 'GOI', label: 'Mumbai → Goa', tone: 'dest-goa' },
  { origin: 'DEL', destination: 'DXB', label: 'Delhi → Dubai', tone: 'dest-dubai' },
] as const;

export { cityFor } from '../lib/airport-catalog';
