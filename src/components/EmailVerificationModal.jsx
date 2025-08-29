"use client";

import { useState, useEffect } from 'react';
import styles from './EmailVerificationModal.module.css';

export default function EmailVerificationModal({ isOpen, onClose, key }) {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (key) {
      verifyEmail(key);
    }
  }, [key]);

  const verifyEmail = async (key) => {
    try {
      const response = await fetch(`/api/auth/verify-email/${key}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.detail || 'Email успешно подтвержден!');
      } else {
        setStatus('error');
        setMessage(data.detail || 'Неверная или устаревшая ссылка подтверждения');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Произошла ошибка при подтверждении email');
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
        
        <div className={styles.content}>
          {status === 'loading' && (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Подтверждение email...</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className={styles.success}>
              <div className={styles.successIcon}>✓</div>
              <h2>Email подтвержден!</h2>
              <p>{message}</p>
              <button className={styles.primaryButton} onClick={onClose}>
                Продолжить
              </button>
            </div>
          )}
          
          {status === 'error' && (
            <div className={styles.error}>
              <div className={styles.errorIcon}>✕</div>
              <h2>Ошибка подтверждения</h2>
              <p>{message}</p>
              <button className={styles.primaryButton} onClick={onClose}>
                Закрыть
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

