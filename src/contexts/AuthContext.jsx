'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 Initializing auth...');
      const accessToken = localStorage.getItem('accessToken');
      console.log('📦 Access token from localStorage:', accessToken ? 'exists' : 'not found');
      
      if (accessToken) {
        try {
          console.log('🔐 Making request to /api/user/profile...');
          const response = await fetch('/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          console.log('📡 Response status:', response.status);
          console.log('📡 Response ok:', response.ok);

                     if (response.ok) {
             const userData = await response.json();
             console.log('👤 User data received:', userData);
             setUser(userData.user_data);
             setIsAuthenticated(true);
             console.log('✅ Auth initialized successfully');
           } else {
            console.log('❌ User request failed, trying refresh token...');
            const refreshTokenValue = localStorage.getItem('refreshToken');
            console.log('🔄 Refresh token exists:', !!refreshTokenValue);
            
                         if (refreshTokenValue) {
               const refreshResult = await refreshToken();
               console.log('🔄 Refresh result:', refreshResult);
               if (refreshResult.success) {
                 console.log('✅ Token refreshed successfully, fetching user data...');
                 try {
                   const userResponse = await fetch('/api/user/profile', {
                     headers: {
                       'Authorization': `Bearer ${refreshResult.accessToken}`,
                     },
                   });
                                       if (userResponse.ok) {
                      const userData = await userResponse.json();
                      console.log('👤 User data after refresh:', userData);
                      setUser(userData.user_data);
                      setIsAuthenticated(true);
                      console.log('✅ Auth initialized successfully after refresh');
                    } else {
                     console.log('❌ Failed to fetch user data after refresh');
                     localStorage.removeItem('accessToken');
                     localStorage.removeItem('refreshToken');
                   }
                 } catch (error) {
                   console.error('💥 Error fetching user data after refresh:', error);
                   localStorage.removeItem('accessToken');
                   localStorage.removeItem('refreshToken');
                 }
               } else {
                 console.log('❌ Refresh failed, clearing tokens');
                 localStorage.removeItem('accessToken');
                 localStorage.removeItem('refreshToken');
               }
             } else {
               console.log('❌ No refresh token, clearing access token');
               localStorage.removeItem('accessToken');
               localStorage.removeItem('refreshToken');
             }
          }
        } catch (error) {
          console.error('💥 Error initializing auth:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
        }
      } else {
        console.log('❌ No access token found');
      }
      
      console.log('🏁 Setting isLoading to false');
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔐 Login attempt for:', email);
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📡 Login response status:', response.status);
      console.log('📡 Login response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Ошибка входа');
      }

      console.log('✅ Login successful, saving tokens...');
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      
      console.log('👤 Fetching user data...');
      const userResponse = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${data.access}`,
        },
      });

      console.log('📡 User response status:', userResponse.status);
             if (userResponse.ok) {
         const userData = await userResponse.json();
         console.log('👤 User data:', userData);
         setUser(userData.user_data);
       } else {
        console.log('❌ Failed to fetch user data');
      }
      
      setIsAuthenticated(true);
      console.log('✅ Login completed, isAuthenticated set to true');
      return { success: true };
    } catch (error) {
      console.error('💥 Login error:', error);
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
    console.log('🚪 Logout called');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
    setUser(null);
    console.log('✅ Logout completed');
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