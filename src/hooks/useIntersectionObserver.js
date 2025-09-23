import { useEffect, useRef } from 'react';

export const useIntersectionObserver = ({
  target,
  onIntersect,
  threshold = 0.1,
  rootMargin = '0px',
  enabled = true,
}) => {
  const observerRef = useRef();

  useEffect(() => {
    if (!enabled || !target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && onIntersect) {
            onIntersect();
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    const element = target.current;
    if (element) {
      observer.observe(element);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [target, onIntersect, threshold, rootMargin, enabled]);

  return observerRef;
};
