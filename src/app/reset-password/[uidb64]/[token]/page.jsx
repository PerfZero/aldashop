"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ResetPasswordModal from '../../../../components/ResetPasswordModal';
import styles from './page.module.css';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const uidb64 = params?.uidb64;
  const token = params?.token;

  const handleClose = () => {
    setIsOpen(false);
    router.push('/');
  };

  if (!uidb64 || !token) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <div className={styles.errorIcon}>✕</div>
          <h2>Ошибка</h2>
          <p>Неверная ссылка для сброса пароля</p>
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
      />
    </div>
  );
}

