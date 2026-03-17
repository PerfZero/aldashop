"use client";

import { useEffect, useState } from "react";
import styles from "./DiscountBadge.module.css";

export default function DiscountBadge() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimeout = window.setTimeout(() => {
      setIsVisible(true);
    }, 3500);

    const onShow = () => setIsVisible(true);
    window.addEventListener("show-discount-badge", onShow);

    return () => {
      window.clearTimeout(showTimeout);
      window.removeEventListener("show-discount-badge", onShow);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className={styles.wrap} aria-label="Промо скидка 50%">
      <button
        type="button"
        className={styles.close}
        onClick={() => setIsVisible(false)}
        aria-label="Скрыть бейдж скидки"
      >
        <span> ×</span>
      </button>
      <button
        type="button"
        className={styles.badge}
        onClick={() => {
          setIsVisible(false);
          window.dispatchEvent(new CustomEvent("open-bitrix-lead-popup"));
        }}
        aria-label="Скидка 50%, показать форму подписки"
      >
        Скидка 50%!
      </button>
    </div>
  );
}
