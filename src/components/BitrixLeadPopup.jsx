"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Playfair_Display } from "next/font/google";
import { useAuth } from "../contexts/AuthContext";
import styles from "./BitrixLeadPopup.module.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SESSION_HANDLED_KEY = "bitrixLeadPopupHandled";
const EMAIL_STORAGE_KEY = "bitrixLeadPopupEmail";
const playfairDisplay = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

export default function BitrixLeadPopup() {
  const { user } = useAuth();

  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsReady(true);
    const handled = sessionStorage.getItem(SESSION_HANDLED_KEY) === "1";
    if (!handled) {
      setIsVisible(true);
    }

    const storedEmail = localStorage.getItem(EMAIL_STORAGE_KEY);
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
  }, [user, email]);

  const closePopup = () => {
    sessionStorage.setItem(SESSION_HANDLED_KEY, "1");
    setIsVisible(false);
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

  if (!isReady || !isVisible) {
    return null;
  }

  return createPortal(
    <div className={styles.overlay}>
      <div
        className={`${styles.modal} ${playfairDisplay.className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bitrix-lead-title"
      >
        <div className={styles.image} />
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
            Присоединяйтесь к нам
          </h2>
          <p className={styles.text}>
            Будьте первыми, кто узнает о наших эксклюзивных предложениях.
            <br />
            А еще получите дополнительную скидку 500 рублей на первый заказ.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              className={`${styles.input} ${error ? styles.inputError : ""}`}
              placeholder="Почта"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              autoComplete="email"
            />
            {error && <p className={styles.error}>{error}</p>}
            <button type="submit" className={styles.button} disabled={isSubmitting}>
              {isSubmitting ? "Отправка..." : "Подписаться"}
            </button>
          </form>

          <p className={styles.note}>
            Будьте первыми, кто узнает о наших эксклюзивных предложениях.
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}
