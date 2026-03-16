"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import styles from "./CustomJivoChat.module.css";

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"]);

const parseFileMessage = (text) => {
  const str = String(text || "").trim();
  // Новый формат: просто URL
  if (/^https?:\/\/\S+$/i.test(str)) {
    const name = str.split("/").pop() || str;
    const ext = name.split(".").pop()?.toLowerCase() || "";
    return { name, url: str, isImage: IMAGE_EXTS.has(ext) };
  }
  // Старый формат: [Файл: name — url]
  const match = str.match(/^\[Файл:\s*(.+?)(?:\s*—\s*(https?:\/\/[^\s\]]+))?\]$/s);
  if (!match) return null;
  const name = match[1].trim();
  const url = match[2]?.trim() || null;
  const ext = name.split(".").pop()?.toLowerCase() || "";
  return { name, url, isImage: IMAGE_EXTS.has(ext) };
};

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

function AldaIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 38 38"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M32.7954 12.8693L32.4059 13.7654C32.3451 13.9114 32.2424 14.036 32.1108 14.1237C31.9792 14.2114 31.8246 14.2582 31.6665 14.2582C31.5084 14.2582 31.3538 14.2114 31.2222 14.1237C31.0907 14.036 30.988 13.9114 30.9271 13.7654L30.5376 12.8693C29.8528 11.2839 28.5986 10.0128 27.0226 9.30676L25.8209 8.77001C25.6751 8.70294 25.5516 8.59547 25.465 8.46035C25.3784 8.32523 25.3324 8.16811 25.3324 8.00763C25.3324 7.84715 25.3784 7.69003 25.465 7.55491C25.5516 7.41979 25.6751 7.31232 25.8209 7.24526L26.9561 6.74017C28.5717 6.01402 29.8474 4.6959 30.5202 3.05734L30.9208 2.08992C30.9796 1.94007 31.0822 1.81141 31.2153 1.72073C31.3483 1.63005 31.5055 1.58154 31.6665 1.58154C31.8275 1.58154 31.9848 1.63005 32.1178 1.72073C32.2508 1.81141 32.3534 1.94007 32.4123 2.08992L32.8129 3.05575C33.485 4.69463 34.76 6.01332 36.3754 6.74017L37.5122 7.24684C37.6575 7.3141 37.7806 7.42155 37.8669 7.5565C37.9531 7.69145 37.999 7.84826 37.999 8.00842C37.999 8.16858 37.9531 8.3254 37.8669 8.46035C37.7806 8.5953 37.6575 8.70275 37.5122 8.77001L36.3089 9.30517C34.7331 10.0119 33.4796 11.2836 32.7954 12.8693ZM31.6665 17.4166C32.7274 17.4166 33.7454 17.2424 34.6986 16.9226C34.7883 17.6034 34.8332 18.2959 34.8332 18.9999C34.8332 27.7447 27.7446 34.8333 18.9999 34.8333C16.399 34.8369 13.8377 34.1973 11.5439 32.9713L3.16652 34.8333L5.02852 26.4558C3.80253 24.1621 3.16287 21.6007 3.16652 18.9999C3.16652 10.2552 10.2551 3.16659 18.9999 3.16659C20.4344 3.16659 21.8229 3.35659 23.1434 3.71442C22.429 5.16302 22.0957 6.76987 22.175 8.38313C22.2543 9.99639 22.7436 11.5628 23.5968 12.9343C24.4499 14.3058 25.6386 15.4372 27.0506 16.2215C28.4627 17.0058 30.0513 17.4171 31.6665 17.4166ZM11.0832 18.9999C11.0832 21.0996 11.9173 23.1132 13.4019 24.5979C14.8866 26.0825 16.9002 26.9166 18.9999 26.9166C21.0995 26.9166 23.1131 26.0825 24.5978 24.5979C26.0824 23.1132 26.9165 21.0996 26.9165 18.9999H23.7499C23.7499 20.2597 23.2494 21.4679 22.3586 22.3587C21.4678 23.2495 20.2596 23.7499 18.9999 23.7499C17.7401 23.7499 16.5319 23.2495 15.6411 22.3587C14.7503 21.4679 14.2499 20.2597 14.2499 18.9999H11.0832Z"
        fill="#844025"
      />
    </svg>
  );
}

function ChatTriggerIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12.0048 10.5H12.0128M15.9998 10.5H16.0088M8.00879 10.5H8.01779"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M2 10.5C2 9.73001 2.013 8.97701 2.04 8.25001C2.123 5.87701 2.165 4.69001 3.13 3.71701C4.095 2.74501 5.316 2.69301 7.756 2.58801C9.16988 2.52865 10.5849 2.49931 12 2.50001C13.48 2.50001 14.905 2.53001 16.244 2.58801C18.684 2.69301 19.904 2.74501 20.87 3.71801C21.835 4.69001 21.877 5.87701 21.96 8.25001C22.0127 9.74955 22.0127 11.2505 21.96 12.75C21.877 15.123 21.835 16.31 20.87 17.283C19.905 18.255 18.684 18.307 16.244 18.412C15.5093 18.4433 14.751 18.4667 13.969 18.482C13.229 18.496 12.858 18.502 12.532 18.627C12.206 18.752 11.932 18.985 11.384 19.455L9.205 21.325C9.09895 21.4159 8.96906 21.4744 8.83073 21.4937C8.69241 21.513 8.55146 21.4922 8.42461 21.4337C8.29776 21.3753 8.19033 21.2817 8.11507 21.1641C8.03981 21.0464 7.99987 20.9097 8 20.77V18.422L7.756 18.412C5.316 18.307 4.096 18.255 3.13 17.282C2.165 16.31 2.123 15.123 2.04 12.75C2.01348 12.0003 2.00015 11.2502 2 10.5Z"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CustomJivoChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [error, setError] = useState("");
  const [attachedFile, setAttachedFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [panelHeight, setPanelHeight] = useState(null);
  const fileInputRef = useRef(null);
  const feedRef = useRef(null);
  const dragRef = useRef(null);

  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    const startY = e.touches ? e.touches[0].clientY : e.clientY;
    const startHeight = dragRef.current?.offsetHeight ?? 700;
    const minH = 300;
    const maxH = window.innerHeight - 100;

    const onMove = (ev) => {
      const y = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const newH = Math.min(maxH, Math.max(minH, startHeight - (y - startY)));
      setPanelHeight(newH);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
  }, []);

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

  const visibleMessages = useMemo(
    () =>
      messages.filter((message) => {
        const textValue = String(message?.text || "")
          .trim()
          .toLowerCase();
        return (
          textValue !== "[typein]" &&
          textValue !== "[typing]" &&
          textValue !== "[system]"
        );
      }),
    [messages],
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
      const lastMsg = data.messages
        .filter((m) => {
          const t = String(m?.text || "")
            .trim()
            .toLowerCase();
          return t !== "[typein]" && t !== "[typing]" && t !== "[system]";
        })
        .at(-1);
      if (lastMsg?.direction === "incoming") {
        setIsWaiting(false);
      }
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

  // Auto-scroll feed to bottom when messages change
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [visibleMessages, isWaiting]);

  const sendMessage = useCallback(
    async (rawText, file) => {
      const nextText = String(rawText || "").trim();
      if (!nextText && !file) return;
      if (isLoading) return;

      setIsLoading(true);
      setError("");
      setText("");
      setAttachedFile(null);
      setImagePreviewUrl(null);
      setIsWaiting(true);

      let messageText = nextText;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploadRes = await fetch("/api/jivo/chat/upload", {
          method: "POST",
          credentials: "include",
          body: formData,
        }).catch(() => null);

        if (uploadRes?.ok) {
          const uploadData = await uploadRes.json().catch(() => ({}));
          const fileUrl = uploadData?.url || "";
          // Отправляем чистую ссылку — Jivo покажет превью автоматически
          messageText = messageText
            ? `${messageText}\n${fileUrl || file.name}`
            : (fileUrl || file.name);
        } else {
          messageText = messageText ? `${messageText}\n${file.name}` : file.name;
        }
      }

      if (!messageText) {
        setIsWaiting(false);
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/jivo/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          text: messageText,
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          pageUrl: window.location.href,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.error || "Не удалось отправить сообщение.");
        setText(rawText || "");
        setIsWaiting(false);
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
    if (!text.trim() && !attachedFile) return;
    await sendMessage(text, attachedFile);
  };

  const handleQuickActionClick = async (value) => {
    await sendMessage(value, null);
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setAttachedFile(f);
      const ext = f.name.split(".").pop()?.toLowerCase() || "";
      if (IMAGE_EXTS.has(ext)) {
        const url = URL.createObjectURL(f);
        setImagePreviewUrl(url);
      } else {
        setImagePreviewUrl(null);
      }
    }
    e.target.value = "";
  };

  const showWelcome = visibleMessages.length === 0;

  return (
    <div className={styles.wrap}>
      {isOpen && (
        <section
          className={styles.panel}
          aria-label="Чат поддержки"
          ref={dragRef}
          style={panelHeight ? { height: panelHeight } : undefined}
        >
          <div
            className={styles.resizeHandle}
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            aria-hidden="true"
          />
          <header className={styles.header}>
            <button
              type="button"
              className={styles.back}
              onClick={() => setIsOpen(false)}
              aria-label="Назад"
            >
              <svg
                width="8"
                height="13"
                viewBox="0 0 8 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7 1L1.5 6.5L7 12"
                  stroke="#3c101e"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Назад
            </button>
            <h3 className={styles.title}>Чат</h3>
            <button
              type="button"
              className={styles.close}
              onClick={() => setIsOpen(false)}
              aria-label="Закрыть чат"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 1L13 13M13 1L1 13"
                  stroke="#3c101e"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </header>

          <div className={styles.feed} ref={feedRef}>
            {showWelcome && (
              <div className={styles.welcome}>
                <div className={styles.welcomeHeading}>
                  <AldaIcon />
                  <p className={styles.welcomeTitle}>
                    Рады Вас приветствовать!
                  </p>
                </div>
                <p className={styles.welcomeText}>
                  Я, ALDA, твой ассистент магазина, я могу помочь найти товар,
                  отследить посылку и многое другое
                </p>
                <p className={styles.welcomeNote}>
                  Краткое напоминание: Я – искусственный интеллект, поэтому,
                  пожалуйста, перепроверяйте ваш заданный вопрос
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
            {visibleMessages.map((message, index) => {
              const isOut = message.direction === "outgoing";
              const prev = visibleMessages[index - 1];
              const next = visibleMessages[index + 1];
              const isFirstInGroup =
                !prev || prev.direction !== message.direction;
              const isLastInGroup =
                !next || next.direction !== message.direction;
              return (
                <div
                  key={message.id}
                  className={isOut ? styles.msgOutWrap : styles.msgInWrap}
                >
                  {!isOut && isFirstInGroup && (
                    <div className={styles.msgSender}>
                      <span className={styles.msgAvatar}>
                        <AldaIcon />
                      </span>
                      <span className={styles.msgSenderName}>ALDA</span>
                    </div>
                  )}
                  <div className={isOut ? styles.msgOut : styles.msgIn}>
                    {(() => {
                      const file = parseFileMessage(message.text);
                      if (file?.isImage && file.url) {
                        return (
                          <a href={file.url} target="_blank" rel="noopener noreferrer">
                            <img src={file.url} alt={file.name} className={styles.msgImage} />
                          </a>
                        );
                      }
                      if (file?.url) {
                        return (
                          <a href={file.url} target="_blank" rel="noopener noreferrer" className={styles.msgFileLink}>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L8 1z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                              <path d="M8 1v4h4" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                            </svg>
                            {file.name}
                          </a>
                        );
                      }
                      return <div className={styles.msgText}>{message.text}</div>;
                    })()}
                  </div>
                  {isOut && isLastInGroup && (
                    <div className={styles.msgTime}>
                      {formatTime(message.createdAt)}
                    </div>
                  )}
                </div>
              );
            })}
            {isWaiting && (
              <div className={styles.msgInWrap}>
                <div className={styles.msgSender}>
                  <span className={styles.msgAvatar}>
                    <AldaIcon />
                  </span>
                  <span className={styles.msgSenderName}>ALDA</span>
                </div>
                <div className={`${styles.msgIn} ${styles.msgThinking}`}>
                  <span>Думает...</span>
                </div>
              </div>
            )}
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {attachedFile && (
              <div className={styles.filePreview}>
                {imagePreviewUrl ? (
                  <img src={imagePreviewUrl} alt={attachedFile.name} className={styles.filePreviewImg} />
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V5L8 1z" stroke="#844025" strokeWidth="1.2" strokeLinejoin="round"/>
                    <path d="M8 1v4h4" stroke="#844025" strokeWidth="1.2" strokeLinejoin="round"/>
                  </svg>
                )}
                <span className={styles.fileName}>{attachedFile.name}</span>
                <button
                  type="button"
                  className={styles.fileRemove}
                  onClick={() => { setAttachedFile(null); setImagePreviewUrl(null); }}
                  aria-label="Убрать файл"
                >×</button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className={styles.fileInput}
              onChange={handleFileChange}
              aria-label="Прикрепить файл"
            />
            <div className={styles.inputWrap}>
              <button
                type="button"
                className={styles.plusBtn}
                aria-label="Прикрепить"
                onClick={() => fileInputRef.current?.click()}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 1V13M1 7H13"
                    stroke="#844025"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
              <input
                className={styles.input}
                type="text"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder={
                  attachedFile ? "Добавить комментарий..." : "Спросить ALDA"
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type="submit"
                className={styles.send}
                disabled={isLoading || (!text.trim() && !attachedFile)}
                aria-label="Отправить"
              >
                <svg
                  width="21"
                  height="21"
                  viewBox="0 0 21 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.08549 0.0792205C0.959941 0.0164265 0.819288 -0.00987136 0.679532 0.00331827C0.539775 0.0165079 0.406525 0.0686556 0.29494 0.153829C0.183354 0.239003 0.0979126 0.353784 0.0483339 0.485115C-0.0012448 0.616446 -0.0129703 0.759055 0.0144914 0.896721L2.11899 8.17172C2.15823 8.30729 2.23493 8.42904 2.34027 8.52298C2.44562 8.61691 2.57532 8.67921 2.71449 8.70272L11.2495 10.1322C11.6515 10.2117 11.6515 10.7877 11.2495 10.8672L2.71449 12.2967C2.57532 12.3202 2.44562 12.3825 2.34027 12.4765C2.23493 12.5704 2.15823 12.6921 2.11899 12.8277L0.0144914 20.1027C-0.0129703 20.2404 -0.0012448 20.383 0.0483339 20.5143C0.0979126 20.6457 0.183354 20.7604 0.29494 20.8456C0.406525 20.9308 0.539775 20.9829 0.679532 20.9961C0.819288 21.0093 0.959941 20.983 1.08549 20.9202L20.5855 11.1702C20.7099 11.1079 20.8145 11.0121 20.8876 10.8937C20.9607 10.7753 20.9994 10.6389 20.9994 10.4997C20.9994 10.3606 20.9607 10.2241 20.8876 10.1057C20.8145 9.98731 20.7099 9.89157 20.5855 9.82922L1.08549 0.0792205Z"
                    fill="#844025"
                  />
                </svg>
              </button>
            </div>
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
        {isOpen ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 4L16 16M16 4L4 16"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <>
            <span className={styles.triggerIcon} aria-hidden="true">
              <ChatTriggerIcon />
            </span>
            <span className={styles.triggerLabel}>чат</span>
          </>
        )}
      </button>
    </div>
  );
}
