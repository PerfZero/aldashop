"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./DiscountBadge.module.css";

const DEFAULT_BADGE_TITLE = "Скидка 50%!";
const DEFAULT_DELAY_MS = 3500;

const normalizeBadgePayload = (payload) => {
  const source =
    payload && typeof payload === "object" && "data" in payload
      ? payload.data
      : payload;

  const item = Array.isArray(source) ? source[0] : source;

  const title =
    typeof item?.title_sale === "string" && item.title_sale.trim()
      ? item.title_sale.trim()
      : DEFAULT_BADGE_TITLE;

  const delaySec = Number(item?.delay_sec);
  const delayMs = Number.isFinite(delaySec) && delaySec >= 0
    ? Math.round(delaySec * 1000)
    : DEFAULT_DELAY_MS;

  return { title, delayMs };
};

export default function DiscountBadge() {
  const [isMounted, setIsMounted] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [badgeTitle, setBadgeTitle] = useState(DEFAULT_BADGE_TITLE);
  const [initialDelayMs, setInitialDelayMs] = useState(null);
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
    let isActive = true;

    const fetchBadgeConfig = async () => {
      try {
        const response = await fetch("/api/products/banner-sale-mailing", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          setInitialDelayMs(DEFAULT_DELAY_MS);
          return;
        }

        const data = await response.json();
        if (!isActive) {
          return;
        }

        const normalized = normalizeBadgePayload(data);
        setBadgeTitle(normalized.title);
        setInitialDelayMs(normalized.delayMs);
      } catch {
        setInitialDelayMs(DEFAULT_DELAY_MS);
      }
    };

    fetchBadgeConfig();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (initialDelayMs === null) {
      return;
    }

    if (enterTimeoutRef.current) {
      window.clearTimeout(enterTimeoutRef.current);
    }

    enterTimeoutRef.current = window.setTimeout(showBadge, initialDelayMs);

    window.addEventListener("show-discount-badge", showBadge);

    return () => {
      if (enterTimeoutRef.current) {
        window.clearTimeout(enterTimeoutRef.current);
      }
      window.removeEventListener("show-discount-badge", showBadge);
    };
  }, [showBadge, initialDelayMs]);

  if (!isMounted) return null;

  return (
    <div
      className={`${styles.wrap} ${isClosing ? styles.wrapClosing : isEntered ? styles.wrapVisible : ""}`}
      aria-label={`Промо ${badgeTitle}`}
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
        aria-label={`${badgeTitle}, показать форму подписки`}
      >
        {badgeTitle}
      </button>
    </div>
  );
}
