'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './page.module.css';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setIsAuthenticated, setUser, mergeSessionData } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const accessToken = searchParams.get('access');
      const refreshToken = searchParams.get('refresh');
      const error = searchParams.get('error');

      if (error) {
        console.error('[AuthCallback] Ошибка авторизации:', error);
        router.push('/');
        return;
      }

      if (!accessToken || !refreshToken) {
        console.error('[AuthCallback] Токены отсутствуют');
        router.push('/');
        return;
      }

      try {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        const userResponse = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData.user_data);
          setIsAuthenticated(true);

          const mergeResult = await mergeSessionData(accessToken);
          if (!mergeResult.success) {
            console.warn('[AuthCallback] Предупреждение при слиянии данных:', mergeResult.error);
          }

          router.push('/');
        } else {
          console.error('[AuthCallback] Ошибка получения профиля:', userResponse.status);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          router.push('/');
        }
      } catch (error) {
        console.error('[AuthCallback] Ошибка обработки callback:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        router.push('/');
      }
    };

    handleCallback();
  }, [searchParams, router, setIsAuthenticated, setUser, mergeSessionData]);

  return (
    <div className={styles.container}>
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
        <p>Завершение авторизации...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className={styles.container}>
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
          <p>Загрузка...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
