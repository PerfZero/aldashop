'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const tryRefreshToken = useCallback(async () => {
    try {
      console.log('[AuthContext] Попытка обновить токен...');
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('[AuthContext] Refresh token отсутствует');
        return false;
      }

      const response = await fetch('/api/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('accessToken', data.access);
        console.log('[AuthContext] Токен успешно обновлен');
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.log('[AuthContext] Ошибка обновления токена:', response.status, errorData);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        return false;
      }
    } catch (error) {
      console.log('[AuthContext] Исключение при обновлении токена:', error);
      return false;
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('[AuthContext] Инициализация авторизации...');
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      console.log('[AuthContext] Access token:', accessToken ? 'присутствует' : 'отсутствует');
      console.log('[AuthContext] Refresh token:', refreshToken ? 'присутствует' : 'отсутствует');
      
      if (accessToken) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          console.log('[AuthContext] Запрос профиля пользователя...');
          const response = await fetch('/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);

          console.log('[AuthContext] Ответ профиля:', response.status);

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user_data);
            setIsAuthenticated(true);
            console.log('[AuthContext] Пользователь авторизован:', userData.user_data.email);
          } else if (response.status === 401) {
            console.log('[AuthContext] Access token истёк (401), пробуем обновить...');
            const refreshed = await tryRefreshToken();
            if (refreshed) {
              console.log('[AuthContext] Повторный запрос профиля с новым токеном...');
              const newAccessToken = localStorage.getItem('accessToken');
              const retryResponse = await fetch('/api/user/profile', {
                headers: {
                  'Authorization': `Bearer ${newAccessToken}`,
                },
              });
              
              if (retryResponse.ok) {
                const userData = await retryResponse.json();
                setUser(userData.user_data);
                setIsAuthenticated(true);
                console.log('[AuthContext] Пользователь авторизован после обновления токена:', userData.user_data.email);
              } else {
                console.log('[AuthContext] Повторный запрос профиля не удался:', retryResponse.status);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
              }
            } else {
              console.log('[AuthContext] Не удалось обновить токен, выход из системы');
            }
          } else {
            console.log('[AuthContext] Ошибка профиля:', response.status);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        } catch (error) {
          console.log('[AuthContext] Ошибка при инициализации:', error.name, error.message);
          if (error.name === 'TypeError' && error.message.includes('fetch') || 
              error.name === 'AbortError') {
          } else {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
          }
        }
      } else {
        console.log('[AuthContext] Access token отсутствует, пользователь не авторизован');
      }
      
      setIsLoading(false);
      console.log('[AuthContext] Инициализация завершена');
    };

    initializeAuth();
  }, [tryRefreshToken]);

  const mergeSessionData = async (accessToken) => {
    try {
      
      const response = await fetch('/api/user/merge-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        // Очищаем localStorage после успешного слияния
        localStorage.removeItem('cart');
        localStorage.removeItem('favourites');
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('[AuthContext] Error merging session data:', error);
      return { success: false, error: error.message };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }

      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      
      const userResponse = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${data.access}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user_data);
      }
      
      // Сливаем данные сессии с аккаунтом пользователя
      await mergeSessionData(data.access);
      
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, first_name, password) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, first_name, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorMessage = data.error || 'Ошибка регистрации';
        if (data.email && Array.isArray(data.email) && data.email.length > 0) {
          errorMessage = data.email[0];
        }
        return { success: false, error: errorMessage, isEmailExists: data.email && Array.isArray(data.email) && data.email.length > 0 };
      }

      const loginResult = await login(email, password);
      if (loginResult.success) {
        return { success: true, data };
      } else {
        return { success: true, data, message: data.detail || 'Регистрация успешна. На вашу почту отправлено письмо с подтверждением.' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const socialLogin = async (provider, accessToken) => {
    try {
      const response = await fetch(`/api/auth/social/${provider}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ access_token: accessToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка социальной авторизации');
      }

      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      
      const userResponse = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${data.access}`,
        },
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user_data);
      }
      
      // Сливаем данные сессии с аккаунтом пользователя
      await mergeSessionData(data.access);
      
      setIsAuthenticated(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('accessToken');
      
      if (refreshToken) {
        // Отправляем запрос на сервер для добавления refresh токена в черный список
        const response = await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        const responseData = await response.json();

        if (!response.ok) {
        } else {
        }
      } else {
      }
    } catch (error) {
    } finally {
      // В любом случае очищаем локальные данные
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const resetPassword = async (email) => {
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(data.error || 'Вы превысили лимит. Повторите попытку позже.');
        }
        throw new Error(data.error || 'Ошибка сброса пароля');
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const changePassword = async (old_password, new_password) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ old_password, new_password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка изменения пароля');
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Нет refresh токена');
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 секунд таймаут
      
      const response = await fetch('/api/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        // Если токен в черном списке или недействителен, сразу очищаем данные
        if (data.code === 'token_not_valid' || response.status === 401) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setIsAuthenticated(false);
          setUser(null);
          return { success: false, error: 'Token invalid' };
        }
        throw new Error('Ошибка обновления токена');
      }

      localStorage.setItem('accessToken', data.access);
      return { success: true, accessToken: data.access };
    } catch (error) {
      // Не делаем logout при сетевых ошибках или таймаутах
      if (error.name === 'TypeError' && error.message.includes('fetch') || 
          error.name === 'AbortError') {
        return { success: false, error: 'Network error' };
      }
      // При ошибке обновления токена просто очищаем локальные данные без API запроса
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      setUser(null);
      return { success: false, error: error.message };
    }
  }, []);

  const getAuthHeaders = useCallback(() => {
    const accessToken = localStorage.getItem('accessToken');
    return accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};
  }, []);

  const getUserProfile = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка получения профиля');
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const updateUserProfile = async (profileData) => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка обновления профиля');
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    setUser,
    setIsAuthenticated,
    login,
    register,
    socialLogin,
    logout,
    resetPassword,
    changePassword,
    refreshToken,
    getAuthHeaders,
    getUserProfile,
    updateUserProfile,
    mergeSessionData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
} 