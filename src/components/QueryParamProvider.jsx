'use client';

import { Suspense } from 'react';
import NextAdapterApp from 'next-query-params/app';
import { QueryParamProvider } from 'use-query-params';

function QueryParamProviderContent({ children }) {
  return (
    <QueryParamProvider adapter={NextAdapterApp}>
      {children}
    </QueryParamProvider>
  );
}

export default function QueryParamProviderWrapper({ children }) {
  return (
    <Suspense fallback={null}>
      <QueryParamProviderContent>
        {children}
      </QueryParamProviderContent>
    </Suspense>
  );
}
