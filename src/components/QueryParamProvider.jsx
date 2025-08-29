'use client';

import NextAdapterApp from 'next-query-params/app';
import { QueryParamProvider } from 'use-query-params';

export default function QueryParamProviderWrapper({ children }) {
  return (
    <QueryParamProvider adapter={NextAdapterApp}>
      {children}
    </QueryParamProvider>
  );
}

