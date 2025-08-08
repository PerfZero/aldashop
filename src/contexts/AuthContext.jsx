'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        try {
          const response = await fetch('/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setUser(userData.user_data);
            setIsAuthenticated(true);
          } else {
            const refreshTokenValue = localStorage.getItem('refreshToken');
            
            if (refreshTokenValue) {
              const refreshResult = await refreshToken();
              if (refreshResult.success) {
                try {
                  const userResponse = await fetch('/api/user/profile', {
                    headers: {
                      'Authorization': `Bearer ${refreshResult.accessToken}`,
                    },
                  });
                  
                  if (userResponse.ok) {
                    const userData = await userResponse.json();
                    setUser(userData.user_data);
                    setIsAuthenticated(true);
                  } else {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                  }
                } catch (error) {
                  localStorage.removeItem('accessToken');
                  localStorage.removeItem('refreshToken');
                }
              } else {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
              }
            } else {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
            }
          }
        } catch (error) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

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
        throw new Error(data.error || 'Ошибка регистрации');
      }

      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
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

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('Нет refresh токена');
      }

      const response = await fetch('/api/auth/token/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Ошибка обновления токена');
      }

      localStorage.setItem('accessToken', data.access);
      return { success: true, accessToken: data.access };
    } catch (error) {
      logout();
      return { success: false, error: error.message };
    }
  };

  const getAuthHeaders = () => {
    const accessToken = localStorage.getItem('accessToken');
    return accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};
  };

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
    login,
    register,
    logout,
    resetPassword,
    changePassword,
    refreshToken,
    getAuthHeaders,
    getUserProfile,
    updateUserProfile,
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