"use client";

import { useState, useEffect } from "react";
import styles from "./PromoBanner.module.css";

function normalizeBanners(payload) {
  const source =
    payload && typeof payload === "object" && "data" in payload
      ? payload.data
      : payload;

  const items = Array.isArray(source) ? source : source ? [source] : [];

  return items
    .map((item, index) => ({
      id: item?.id ?? index,
      text: typeof item?.text === "string" ? item.text.trim() : "",
      description:
        typeof item?.description === "string" ? item.description : "",
      display_timer: Boolean(item?.display_timer),
      time_leave_sec: Number(item?.time_leave_sec) || 0,
    }))
    .filter((item) => Boolean(item.text) || Boolean(item.description));
}

export default function PromoBanner() {
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [isClosed, setIsClosed] = useState(false);
  const [animationPhase, setAnimationPhase] = useState("idle");
  const activeBanner = banners[activeIndex] || null;

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch("/api/products/banner", {
          method: "GET",
          cache: "no-store",
        });
        if (!response.ok) {
          console.error(
            `Ошибка загрузки баннера: HTTP ${response.status} ${response.statusText}`,
          );
          return;
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.toLowerCase().includes("application/json")) {
          const bodySnippet = await response.text();
          console.error(
            "Ошибка загрузки баннера: сервер вернул не JSON",
            bodySnippet.slice(0, 200),
          );
          return;
        }

        const data = await response.json();
        const normalized = normalizeBanners(data);
        setBanners(normalized);
        setActiveIndex(0);
      } catch (error) {
        console.error("Ошибка загрузки баннера:", error);
      }
    };

    fetchBanner();
  }, []);

  useEffect(() => {
    if (!activeBanner?.description || !activeBanner?.display_timer) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      return;
    }

    const calculateTimeLeft = () => {
      const endDate = new Date(activeBanner.description);
      if (Number.isNaN(endDate.getTime())) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
        return;
      }

      const now = new Date();
      const difference = endDate - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);

        setTimeLeft({ days, hours, minutes });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);

    return () => clearInterval(timer);
  }, [activeBanner]);

  useEffect(() => {
    if (banners.length < 2 || !activeBanner) return;

    const rotateAfterSec = Math.max(1, activeBanner.time_leave_sec || 5);
    const nextIndex = (activeIndex + 1) % banners.length;
    const rotationTimer = window.setTimeout(() => {
      setAnimationPhase("out");
    }, rotateAfterSec * 1000);

    const switchTimer = window.setTimeout(
      () => {
        setActiveIndex(nextIndex);
        setAnimationPhase("in");
      },
      rotateAfterSec * 1000 + 220,
    );

    const resetAnimationTimer = window.setTimeout(
      () => {
        setAnimationPhase("idle");
      },
      rotateAfterSec * 1000 + 520,
    );

    return () => {
      window.clearTimeout(rotationTimer);
      window.clearTimeout(switchTimer);
      window.clearTimeout(resetAnimationTimer);
    };
  }, [banners.length, activeBanner, activeIndex]);

  const hasText = Boolean(activeBanner?.text);
  const hasTimer = Boolean(
    activeBanner?.description && activeBanner?.display_timer,
  );

  if (isClosed || !activeBanner || (!hasText && !hasTimer)) {
    return null;
  }

  return (
    <div className={styles.promoBanner}>
      <div className={styles.promoBanner__container}>
        <div
          className={`${styles.promoBanner__content} ${
            animationPhase === "out"
              ? styles.promoBanner__content_out
              : animationPhase === "in"
                ? styles.promoBanner__content_in
                : ""
          }`}
        >
          {hasText && (
            <span className={styles.promoBanner__text}>
              {activeBanner.text}
            </span>
          )}
          {hasTimer && (
            <span className={styles.promoBanner__timer}>
              {timeLeft.days}Д {String(timeLeft.hours).padStart(2, "0")}Ч{" "}
              {String(timeLeft.minutes).padStart(2, "0")}М
            </span>
          )}
        </div>
        <button
          type="button"
          className={styles.promoBanner__close}
          onClick={() => setIsClosed(true)}
          aria-label="Скрыть верхний баннер"
        >
          ×
        </button>
      </div>
    </div>
  );
}
