"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./DiscountBadge.module.css";

export default function DiscountBadge() {
  const [isMounted, setIsMounted] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const closeRequestedRef = useRef(false);
  const enterTimeoutRef = useRef(null);

  const showBadge = useCallback(() => {
    closeRequestedRef.current = false;
    setIsClosing(false);
    setIsMounted(true);
    setIsEntered(false);
    window.setTimeout(() => {
      setIsEntered(true);
    }, 24);
  }, []);

  const hideBadge = useCallback(() => {
    if (closeRequestedRef.current) {
      return;
    }

    closeRequestedRef.current = true;
    setIsClosing(true);
    setIsEntered(false);
  }, []);

  useEffect(() => {
    enterTimeoutRef.current = window.setTimeout(showBadge, 3500);

    window.addEventListener("show-discount-badge", showBadge);

    return () => {
      if (enterTimeoutRef.current) {
        window.clearTimeout(enterTimeoutRef.current);
      }
      window.removeEventListener("show-discount-badge", showBadge);
    };
  }, [showBadge]);

  if (!isMounted) return null;

  return (
    <div
      className={`${styles.wrap} ${isClosing ? styles.wrapClosing : isEntered ? styles.wrapVisible : ""}`}
      aria-label="Промо скидка 50%"
      onAnimationEnd={(event) => {
        if (
          isClosing &&
          event.target === event.currentTarget &&
          event.animationName === "discountBadgeSlideOutLeft"
        ) {
          setIsMounted(false);
          setIsClosing(false);
          closeRequestedRef.current = false;
        }
      }}
    >
      <button
        type="button"
        className={styles.close}
        onClick={hideBadge}
        aria-label="Скрыть бейдж скидки"
      >
        <span> ×</span>
      </button>
      <button
        type="button"
        className={styles.badge}
        onClick={() => {
          hideBadge();
          window.dispatchEvent(new CustomEvent("open-bitrix-lead-popup"));
        }}
        aria-label="Скидка 50%, показать форму подписки"
      >
        Скидка 50%!
      </button>
    </div>
  );
}
