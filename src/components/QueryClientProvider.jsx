'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export default function QueryClientProviderWrapper({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000, // 10 минут - данные считаются свежими
        gcTime: 60 * 60 * 1000, // 1 час - время жизни кеша
        refetchOnWindowFocus: false,
        refetchOnMount: false, // Не перезагружать при возврате на страницу
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
