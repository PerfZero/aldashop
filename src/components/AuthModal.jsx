"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import LegalModal from './LegalModal';
import styles from './AuthModal.module.css';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, resetPassword } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNews, setAcceptNews] = useState(false);
  const [termsUrl, setTermsUrl] = useState('#');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  });
  const [modalData, setModalData] = useState({ isOpen: false, title: '', content: '', type: '', pdfUrl: null });

  useEffect(() => {
    const fetchTermsUrl = async () => {
      try {
        const response = await fetch('https://aldalinde.ru/api/documents?type=public_offer');
        if (response.ok) {
          const data = await response.json();
          if (data.url) {
            const fullUrl = data.url.startsWith('http') ? data.url : `https://aldalinde.ru${data.url}`;
            setTermsUrl(fullUrl);
          }
        }
      } catch (error) {
      }
    };
    fetchTermsUrl();
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Пожалуйста, введите адрес электронной почты';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Пожалуйста, введите действующий адрес электронной почты';
    }

    if (!isResetPassword) {
      if (!formData.password) {
        newErrors.password = 'Пожалуйста, введите пароль';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Пароль должен быть длиной не менее 8 символов';
      }

      if (!isLogin) {
        if (!formData.name) {
          newErrors.name = 'Пожалуйста, введите имя';
        }
        
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Пожалуйста, подтвердите пароль';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Пароли не совпадают';
        }

        if (!acceptTerms) {
          newErrors.terms = 'Необходимо принять условия пользования';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitted(true);
    setResetError('');
    setIsLoading(true);
    
    try {
      if (validateForm()) {
        if (isResetPassword) {
          const result = await resetPassword(formData.email);
          
          if (result.success) {
            setResetError('');
            setShowConfirmationMessage(true);
            setTimeout(() => {
              setShowConfirmationMessage(false);
              onClose();
            }, 3000);
          } else {
            setResetError(result.error);
          }
        } else {
          if (!isLogin) {
            const result = await register(formData.email, formData.name, formData.password);
            
            if (result.success) {
              setRegisteredEmail(formData.email);
              setConfirmationMessage(result.message || 'Регистрация успешна. На вашу почту отправлено письмо с подтверждением.');
              setShowConfirmationMessage(true);
            } else {
              setErrors(prev => ({ ...prev, general: result.error }));
            }
          } else {
            const result = await login(formData.email, formData.password);
            
            if (result.success) {
              onClose();
            } else {
              setErrors(prev => ({ ...prev, general: result.error }));
            }
          }
        }
      }
    } catch (error) {
      setErrors(prev => ({ ...prev, general: 'Произошла ошибка при авторизации' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Очищаем ошибки при вводе
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    if (resetError) {
      setResetError('');
    }
  };

  const handleResetPassword = () => {
    setIsResetPassword(true);
    setErrors({});
    setResetError('');
    setIsSubmitted(false);
    setShowConfirmationMessage(false);
    setConfirmationMessage('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setShowPasswords({
      password: false,
      confirmPassword: false
    });
  };

  const handleBackToLogin = () => {
    setIsResetPassword(false);
    setErrors({});
    setResetError('');
    setIsSubmitted(false);
    setShowConfirmationMessage(false);
    setConfirmationMessage('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
    setShowPasswords({
      password: false,
      confirmPassword: false
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleResendEmail = async () => {
    if (!registeredEmail) return;
    
    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-email-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: registeredEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setConfirmationMessage(data.detail || 'Письмо с подтверждением отправлено повторно на вашу электронную почту.');
      } else {
        setConfirmationMessage(data.error || data.detail || 'Ошибка при отправке письма. Попробуйте позже.');
      }
    } catch (error) {
      setConfirmationMessage('Произошла ошибка при отправке письма. Попробуйте позже.');
    } finally {
      setIsResending(false);
    }
  };

  const openDocumentModal = async (e) => {
    e.preventDefault();
    if (!termsUrl || termsUrl === '#') {
      try {
        const response = await fetch('https://aldalinde.ru/api/documents?type=public_offer');
        if (response.ok) {
          const data = await response.json();
          if (data.url) {
            const fullUrl = data.url.startsWith('http') ? data.url : `https://aldalinde.ru${data.url}`;
            if (fullUrl.endsWith('.pdf')) {
              setModalData({
                isOpen: true,
                title: 'Правила пользования',
                content: '',
                type: 'terms',
                pdfUrl: fullUrl
              });
              return;
            }
            const contentResponse = await fetch(fullUrl);
            if (contentResponse.ok) {
              const content = await contentResponse.text();
              setModalData({
                isOpen: true,
                title: 'Правила пользования',
                content: content,
                type: 'terms',
                pdfUrl: null
              });
            }
          }
        }
      } catch (error) {
        setModalData({
          isOpen: true,
          title: 'Правила пользования',
          content: '<p>Ошибка загрузки документа</p>',
          type: 'terms',
          pdfUrl: null
        });
      }
    } else {
      if (termsUrl.endsWith('.pdf')) {
        setModalData({
          isOpen: true,
          title: 'Правила пользования',
          content: '',
          type: 'terms',
          pdfUrl: termsUrl
        });
      } else {
        try {
          const contentResponse = await fetch(termsUrl);
          if (contentResponse.ok) {
            const content = await contentResponse.text();
            setModalData({
              isOpen: true,
              title: 'Правила пользования',
              content: content,
              type: 'terms',
              pdfUrl: null
            });
          }
        } catch (error) {
          setModalData({
            isOpen: true,
            title: 'Правила пользования',
            content: '<p>Ошибка загрузки документа</p>',
            type: 'terms',
            pdfUrl: null
          });
        }
      }
    }
  };

  const closeModal = () => {
    setModalData({ isOpen: false, title: '', content: '', type: '', pdfUrl: null });
  };

  if (!isOpen) return null;

  if (showConfirmationMessage) {
    return (
      <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className={styles.modal}>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 7.5L22.5 22.5M22.5 7.5L7.5 22.5" stroke="#C1AF86" strokeLinecap="round" />
            </svg>
          </button>
          <div className={styles.confirmationMessage}>
            <h2 className={styles.title}>
              {showConfirmationMessage && isResetPassword ? 'Письмо отправлено!' : 'Регистрация успешна!'}
            </h2>
            <p className={styles.subtitle}>
              {showConfirmationMessage && isResetPassword 
                ? 'Письмо с инструкциями по сбросу пароля отправлено на вашу электронную почту. Пожалуйста, проверьте почту и следуйте инструкциям.'
                : confirmationMessage || 'Письмо с подтверждением отправлено на вашу электронную почту. Пожалуйста, проверьте почту и перейдите по ссылке для подтверждения аккаунта.'
              }
            </p>
            {!isResetPassword && (
              <p className={styles.spamNote}>
                Обратите внимание: письмо подтверждения может попасть в папку «Спам». Пожалуйста, проверьте папку «Спам», если не видите письмо во входящих.
              </p>
            )}
            {!isResetPassword && (
              <div className={styles.resendActions}>
                <button 
                  className={styles.resendButton} 
                  onClick={handleResendEmail}
                  disabled={isResending}
                >
                  {isResending ? 'Отправка...' : 'Отправить повторно'}
                </button>
                <button 
                  className={styles.closeConfirmButton} 
                  onClick={onClose}
                >
                  Закрыть
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${isResetPassword ? 'modals' : ''}`}>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 7.5L22.5 22.5M22.5 7.5L7.5 22.5" stroke="#C1AF86" strokeLinecap="round" />
          </svg>
        </button>

        {isResetPassword ? (
          <>
            <h2 className={styles.title}>Сброс пароля</h2>
            <p className={styles.subtitle}>
              Укажите электронную почту, привязанную к вашему аккаунту, и мы отправим на нее письмо с ссылкой для восстановления пароля.
            </p>
            <div className={styles.emailAuth}>
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.inputWrapper}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Электронная почта"
                    className={`${styles.input} ${errors.email || resetError ? styles.inputError : ''}`}
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete='none'
                  />
                  {isSubmitted && errors.email && (
                    <span className={styles.errorText}>{errors.email}</span>
                  )}
                  {resetError && (
                    <span className={styles.errorText}>{resetError}</span>
                  )}
                </div>
                <button type="submit" className={styles.submitButton} disabled={isLoading}>
                  {isLoading ? "Загрузка..." : "Отправить ссылку"}
                </button>
              </form>
              <p className={styles.switchMode}>
                <button onClick={handleBackToLogin}>
                  Вернуться к входу
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <h2 className={styles.title}>
              {isLogin ? "Добро пожаловать!" : "Добро пожаловать!"}
            </h2>
            <p className={styles.subtitle}>
              {isLogin 
                ? "Войдите или зарегистрируйтесь! Покупка мебели — это путь к идеальному пространству вместе с нами!"
                : "Войдите или зарегистрируйтесь! Покупка мебели — это путь к идеальному      пространству вместе с нами!"}
            </p>

            <div className={styles.content}>
              <div className={styles.socialAuth}>
                <h3>{isLogin ? "Быстрый вход" : "Быстрая регистрация"}</h3>
                <button className={`${styles.socialButton} ${styles.vkButton}`}>
                  <img src="/vk.svg" alt="Вконтакте" />
                  Вход через Вконтакте
                </button>
                <button className={`${styles.socialButton} ${styles.yandexButton}`}>
                  <img src="/ya.svg" alt="Яндекс" />
                  Вход через Яндекс
                </button>
                <button className={`${styles.socialButton} ${styles.googleButton}`}>
                  <img src="/google.svg" alt="Google" />
                  Вход через Google
                </button>
              </div>

              <div className={styles.divider}>
                <span>или</span>
              </div>

              <div className={styles.emailAuth}>
                <h3>{isLogin ? "Войти через электронную почту" : "Зарегистрироваться через электронную почту"}</h3>
                <form className={styles.form} onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className={styles.inputWrapper}>
                      <input
                        type="text"
                        name="name"
                        placeholder="Имя"
                        className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                        value={formData.name}
                        onChange={handleChange}
                      />
                      {isSubmitted && errors.name && (
                        <span className={styles.errorText}>{errors.name}</span>
                      )}
                    </div>
                  )}
                  <div className={styles.inputWrapper}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Электронная почта"
                      className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete='none'
                    />
                    {isSubmitted && errors.email && (
                      <span className={styles.errorText}>{errors.email}</span>
                    )}
                  </div>
                  <div className={styles.inputWrapper}>
                    <div className={styles.passwordInputContainer}>
                      <input
                        type={showPasswords.password ? "text" : "password"}
                        name="password"
                        placeholder="Пароль"
                        className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                        value={formData.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => togglePasswordVisibility('password')}
                      >
                        {showPasswords.password ? (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        ) : (
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    </div>
                    {isSubmitted && errors.password && (
                      <span className={styles.errorText}>{errors.password}</span>
                    )}
                  </div>
                  {!isLogin && (
                    <div className={styles.inputWrapper}>
                      <div className={styles.passwordInputContainer}>
                        <input
                          type={showPasswords.confirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          placeholder="Повтор пароля"
                          className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                          value={formData.confirmPassword}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          className={styles.passwordToggle}
                          onClick={() => togglePasswordVisibility('confirmPassword')}
                        >
                          {showPasswords.confirmPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          )}
                        </button>
                      </div>
                      {isSubmitted && errors.confirmPassword && (
                        <span className={styles.errorText}>{errors.confirmPassword}</span>
                      )}
                    </div>
                  )}
                  
                  {isLogin && (
                    <a href="#" className={styles.forgotPassword} onClick={(e) => {
                      e.preventDefault();
                      handleResetPassword();
                    }}>
                      Забыли пароль?
                    </a>
                  )}

                  <button type="submit" className={styles.submitButton} disabled={isLoading}>
                    {isLoading ? "Загрузка..." : (isLogin ? "Войти" : "Зарегистрироваться")}
                  </button>
                  {errors.general && (
                    <span className={styles.errorText}>{errors.general}</span>
                  )}
                </form>

                <p className={styles.switchMode}>
                  {isLogin ? "Впервые в ALDA? " : "Уже зарегистрированы?"}
                  <button onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                    setIsSubmitted(false);
                    setShowConfirmationMessage(false);
                    setConfirmationMessage('');
                    setFormData({
                      name: '',
                      email: '',
                      password: '',
                      confirmPassword: ''
                    });
                    setShowPasswords({
                      password: false,
                      confirmPassword: false
                    });
                  }}>
                    {isLogin ? "Зарегистрироваться" : "Войти"}
                  </button>
                </p>
              </div>
            </div>
            {!isLogin && (
              <div className={styles.checkboxGroup}>
                <label className={`${styles.checkbox} ${errors.terms ? styles.checkboxError : ''}`}>
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked);
                      if (errors.terms) {
                        setErrors(prev => ({ ...prev, terms: '' }));
                      }
                    }}
                  />
                  <span>Установив флажок, я даю согласие на обработку <button type="button" onClick={openDocumentModal} className={styles.documentLink}>персональных данных</button></span>
                </label>
                {isSubmitted && errors.terms && (
                  <span className={styles.errorText}>{errors.terms}</span>
                )}
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={acceptNews}
                    onChange={(e) => setAcceptNews(e.target.checked)}
                  />
                  <span>Установив флажок, я хочу получать последние новости от ALDA.</span>
                </label>
              </div>
            )}
          </>
        )}
      </div>
      <LegalModal
        isOpen={modalData.isOpen}
        onClose={closeModal}
        title={modalData.title}
        content={modalData.content}
        type={modalData.type}
        pdfUrl={modalData.pdfUrl}
      />
    </div>
  );
} 