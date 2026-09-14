import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { RouterProvider } from 'react-router-dom';
import { SessionBootstrap } from '@features/auth';
import { store } from '@app/store';
import { router } from '@app/providers/router';
import { SitePrefsProvider } from '@shared/i18n';
import { preloadCatalogs } from '@shared/lib/catalogs';

preloadCatalogs();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
    mutations: { retry: false },
  },
});

export const App = (): JSX.Element => {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <SitePrefsProvider>
          <SessionBootstrap>
            <RouterProvider router={router} />
          </SessionBootstrap>
        </SitePrefsProvider>
      </QueryClientProvider>
    </Provider>
  );
};
