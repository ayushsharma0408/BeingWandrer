import { preloadAirlineCatalog } from './airline-catalog';
import { preloadAirportCatalog } from './airport-catalog';

export const preloadCatalogs = (): void => {
  void preloadAirportCatalog();
  void preloadAirlineCatalog();
};
