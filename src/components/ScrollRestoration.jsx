'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollRestoration() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isCatalogPage = pathname?.startsWith('/categories');
    
    if (isCatalogPage) {
      const handleClick = (e) => {
        const link = e.target.closest('a[href*="/product/"]');
        if (link) {
          sessionStorage.setItem('catalogScrollPosition', window.scrollY.toString());
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

