import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export function useScrollRestoration(key) {
  const router = useRouter();
  const scrollPositions = useRef(new Map());
  
  useEffect(() => {
    const saveScrollPosition = () => {
      const scrollKey = key || window.location.pathname;
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      scrollPositions.current.set(scrollKey, scrollPosition);
      sessionStorage.setItem('scrollPositions', JSON.stringify(Array.from(scrollPositions.current)));
    };

    const restoreScrollPosition = () => {
      const scrollKey = key || window.location.pathname;
      const saved = sessionStorage.getItem('scrollPositions');
      
      if (saved) {
        try {
          const positions = new Map(JSON.parse(saved));
          scrollPositions.current = positions;
          const position = positions.get(scrollKey);
          
          if (position && position > 0) {
            setTimeout(() => {
              window.scrollTo(0, position);
            }, 100);
          }
        } catch (e) {
          console.error('Error restoring scroll position:', e);
        }
      }
    };

    const handleRouteChange = () => {
      saveScrollPosition();
    };

    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    restoreScrollPosition();

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [key]);

  const saveCurrentPosition = () => {
    const scrollKey = key || window.location.pathname;
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    scrollPositions.current.set(scrollKey, scrollPosition);
    sessionStorage.setItem('scrollPositions', JSON.stringify(Array.from(scrollPositions.current)));
  };

  return { saveCurrentPosition };
}

