"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ResetPasswordModal from '../../../components/ResetPasswordModal';
import styles from './page.module.css';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [uidb64, setUidb64] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const key = params?.key;

  useEffect(() => {
    if (key) {
      fetchResetData(key);
    } else {
      setError('Неверная ссылка для сброса пароля');
      setIsLoading(false);
    }
  }, [key]);

  const fetchResetData = async (resetKey) => {
    try {
      const response = await fetch(`/api/auth/reset-password-key/${resetKey}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.uidb64 && data.token) {
          setUidb64(data.uidb64);
          setToken(data.token);
        } else if (data.uid && data.token) {
          setUidb64(data.uid);
          setToken(data.token);
        } else {
          setUidb64(null);
          setToken(null);
        }
      } else {
        setError(data.error || data.detail || 'Неверная или устаревшая ссылка для сброса пароля');
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>✕</div>
          <h2>Ошибка</h2>
          <p>{error}</p>
          <button className={styles.button} onClick={handleClose}>
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ResetPasswordModal 
        isOpen={isOpen} 
        onClose={handleClose}
        uidb64={uidb64}
        token={token}
        resetKey={key}
      />
    </div>
  );
}

