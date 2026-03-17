"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../contexts/AuthContext";
import styles from "./BitrixLeadPopup.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_HANDLED_KEY = "bitrixLeadPopupHandled";
const EMAIL_STORAGE_KEY = "bitrixLeadPopupEmail";
export default function BitrixLeadPopup() {
  const { user } = useAuth();

  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState(null);
  const closeRequestedRef = useRef(false);

  useEffect(() => {
    setIsReady(true);
    const storedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch(
          "https://aldalinde.ru/api/products/get_banner_sale_mailing",
          {
            method: "GET",
            cache: "no-store",
          },
        );
        if (!response.ok) {
          console.error(
            `Ошибка загрузки popup-баннера: HTTP ${response.status} ${response.statusText}`,
          );
          return;
        }

        const contentType = response.headers.get("content-type") || "";
        if (!contentType.toLowerCase().includes("application/json")) {
          const bodySnippet = await response.text();
          console.error(
            `Ошибка загрузки popup-баннера: не JSON (${bodySnippet.slice(0, 200)})`,
          );
          return;
        }

        const data = await response.json();
        const payload = data?.data;
        if (!payload || typeof payload !== "object") {
          console.error("Ошибка загрузки popup-баннера: пустой payload");
          return;
        }

        setContent({
          title_mailing: payload.title_mailing || "",
          text_mailing: payload.text_mailing || "",
          text_mailing_input: payload.text_mailing_input || "",
          text_mailing_button: payload.text_mailing_button || "",
          text_mailing2: payload.text_mailing2 || "",
          image_url: payload.image_url || "",
        });
      } catch (error) {
        console.error(
          "Ошибка загрузки popup-баннера:",
          error?.message || error,
        );
      }
    };

    loadContent();
  }, []);

  useEffect(() => {
    const onOpen = () => {
      closeRequestedRef.current = false;
      setIsClosing(false);
      setIsVisible(true);
    };

    window.addEventListener("open-bitrix-lead-popup", onOpen);
    return () => window.removeEventListener("open-bitrix-lead-popup", onOpen);
  }, []);

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  const closePopup = () => {
    if (closeRequestedRef.current) {
      return;
    }

    closeRequestedRef.current = true;
    sessionStorage.setItem(SESSION_HANDLED_KEY, "1");
    setIsClosing(true);
    window.dispatchEvent(new CustomEvent("show-discount-badge"));
  };

  const handleModalAnimationEnd = (event) => {
    if (
      isClosing &&
      event.target === event.currentTarget &&
      event.animationName === "popupModalOutRight"
    ) {
      setIsVisible(false);
      setIsClosing(false);
      closeRequestedRef.current = false;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const normalizedEmail = email.trim();

    if (!EMAIL_REGEX.test(normalizedEmail)) {
      setError("Введите корректный email");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bitrix/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: normalizedEmail,
          pageUrl: window.location.href,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Не удалось отправить заявку");
      }

      localStorage.setItem(EMAIL_STORAGE_KEY, normalizedEmail);
      closePopup();
    } catch (submitError) {
      setError(submitError.message || "Не удалось отправить заявку");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady || !isVisible || !content) {
    return null;
  }

  return createPortal(
    <div className={styles.overlay}>
      <div
        className={`${styles.modal} ${isClosing ? styles.modalClosing : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bitrix-lead-title"
        onAnimationEnd={handleModalAnimationEnd}
      >
        <div
          className={styles.image}
          style={{
            backgroundImage: content.image_url
              ? `url(${content.image_url})`
              : "none",
          }}
        />
        <div className={styles.content}>
          <button
            type="button"
            className={styles.close}
            onClick={closePopup}
            aria-label="Закрыть"
          >
            ×
          </button>

          <h2 id="bitrix-lead-title" className={styles.title}>
            {content.title_mailing}
          </h2>
          <p className={styles.text}>{content.text_mailing}</p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              className={`${styles.input} ${error ? styles.inputError : ""}`}
              placeholder={content.text_mailing_input}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              autoComplete="email"
            />
            {error && <p className={styles.error}>{error}</p>}
            <button
              type="submit"
              className={styles.button}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Отправка..." : content.text_mailing_button}
            </button>
          </form>

          <p className={styles.note}>{content.text_mailing2}</p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
