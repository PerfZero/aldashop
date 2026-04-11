'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const CATALOG_RETURN_CONTEXT_KEY = "catalogReturnContext";

export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isCatalogPage = pathname?.startsWith('/categories');
    
    if (isCatalogPage) {
      const handleClick = (e) => {
        const link = e.target.closest('a[href*="/product/"]');
        if (link) {
          const context = {
            url: `${window.location.pathname}${window.location.search}`,
            scrollY: window.scrollY,
            timestamp: Date.now(),
          };
          sessionStorage.setItem(
            CATALOG_RETURN_CONTEXT_KEY,
            JSON.stringify(context),
          );
          // Legacy fallback key for older restoration logic.
          sessionStorage.setItem("catalogScrollPosition", window.scrollY.toString());
        }
      };

      document.addEventListener('click', handleClick, true);

      return () => {
        document.removeEventListener('click', handleClick, true);
      };
    }
  }, [pathname]);

  return null;
}
