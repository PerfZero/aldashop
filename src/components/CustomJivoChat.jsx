"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import styles from "./CustomJivoChat.module.css";

const QUICK_ACTIONS = [
  "Покажите мне текущие предложения",
  "Помогите мне выбрать правильный диван",
  "Покажите мне бестселлеры",
];

const formatTime = (value) => {
  const date = new Date(value || Date.now());
  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function CustomJivoChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const profile = useMemo(
    () => ({
      name:
        user?.first_name ||
        user?.full_name ||
        (user?.email ? user.email.split("@")[0] : "Гость"),
      email: user?.email || "",
      phone: user?.phone || "",
    }),
    [user],
  );

  const fetchMessages = useCallback(async () => {
    const response = await fetch("/api/jivo/chat/messages", {
      credentials: "include",
      cache: "no-store",
    });
    if (!response.ok) return;
    const data = await response.json();
    if (Array.isArray(data?.messages)) {
      setMessages(data.messages);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    if (!isOpen) return undefined;
    const timer = window.setInterval(fetchMessages, 3500);
    return () => window.clearInterval(timer);
  }, [isOpen, fetchMessages]);

  const sendMessage = useCallback(
    async (rawText) => {
      const nextText = String(rawText || "").trim();
      if (!nextText || isLoading) return;

      setIsLoading(true);
      setError("");
      setText("");

      const response = await fetch("/api/jivo/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          text: nextText,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          pageUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.error || "Не удалось отправить сообщение.");
        setText(nextText);
        setIsLoading(false);
        return;
      }

      await fetchMessages();
      setIsLoading(false);
    },
    [fetchMessages, isLoading, profile.email, profile.name, profile.phone],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextText = text.trim();
    if (!nextText) return;
    await sendMessage(nextText);
  };

  const handleQuickActionClick = async (value) => {
    await sendMessage(value);
  };

  const showWelcome = messages.length === 0;

  return (
    <div className={styles.wrap}>
      {isOpen && (
        <section className={styles.panel} aria-label="Чат поддержки">
          <header className={styles.header}>
            <div>
              <h3 className={styles.title}>Поддержка ALDA</h3>
              <p className={styles.subtitle}>Ответим в этом же окне</p>
            </div>
            <button
              type="button"
              className={styles.close}
              onClick={() => setIsOpen(false)}
              aria-label="Свернуть чат"
            >
              ×
            </button>
          </header>

          <div className={styles.feed}>
            {showWelcome && (
              <div className={styles.welcome}>
                <p className={styles.welcomeTitle}>Рады Вас приветствовать!</p>
                <p className={styles.welcomeText}>
                  Я, ALDA, твой ассистент магазина, я могу помочь найти товар, отследить
                  посылку и многое другое.
                </p>
                <p className={styles.welcomeNote}>
                  Краткое напоминание: Я - искусственный интеллект, поэтому, пожалуйста,
                  перепроверяйте ваш заданный вопрос.
                </p>
                <div className={styles.quickActions}>
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action}
                      type="button"
                      className={styles.quickAction}
                      onClick={() => handleQuickActionClick(action)}
                      disabled={isLoading}
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.msg} ${
                  message.direction === "outgoing" ? styles.msgOut : styles.msgIn
                }`}
              >
                <div className={styles.msgText}>{message.text}</div>
                <div className={styles.msgMeta}>{formatTime(message.createdAt)}</div>
              </div>
            ))}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <textarea
              className={styles.input}
              rows={2}
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Ваше сообщение..."
            />
            <button type="submit" className={styles.send} disabled={isLoading || !text.trim()}>
              {isLoading ? "..." : "Отправить"}
            </button>
          </form>
          {error && <div className={styles.error}>{error}</div>}
        </section>
      )}

      <button
        type="button"
        className={styles.trigger}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "Свернуть чат" : "Открыть чат"}
      >
        {isOpen ? "—" : "Чат"}
      </button>
    </div>
  );
}
