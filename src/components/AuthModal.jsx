"use client";

import { useState } from 'react';
import styles from './AuthModal.module.css';

export default function AuthModal({ isOpen, onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetPassword, setIsResetPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptNews, setAcceptNews] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetError, setResetError] = useState('');

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
    
    if (validateForm()) {
      if (isResetPassword) {
        try {
          // Здесь будет API запрос для проверки email
          // Имитация API запроса
          const emailExists = false; // Это будет результат проверки с бэкенда
          
          if (!emailExists) {
            setResetError('Электронная почта не найдена');
            return;
          }
          
          // Если email найден, отправляем письмо для сброса пароля
          console.log('Password reset email sent to:', formData.email);
          // Здесь будет логика отправки письма
          
        } catch (error) {
          console.error('Error during password reset:', error);
          setResetError('Произошла ошибка при сбросе пароля');
        }
      } else {
        // Логика для входа/регистрации
        console.log('Form submitted:', formData);
      }
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
  };

  const handleBackToLogin = () => {
    setIsResetPassword(false);
    setErrors({});
    setResetError('');
    setIsSubmitted(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`${styles.modal} ${isResetPassword ? 'modals' : ''}`}>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.5 7.5L22.5 22.5M22.5 7.5L7.5 22.5" stroke="#C1AF86" stroke-linecap="round" />
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
                <button type="submit" className={styles.submitButton}>
                  Отправить ссылку
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
                  Вход через Вконтакте
                </button>
                <button className={`${styles.socialButton} ${styles.yandexButton}`}>
                  Вход через Яндекс
                </button>
                <button className={`${styles.socialButton} ${styles.googleButton}`}>
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
                    <input
                      type="password"
                      name="password"
                      placeholder="Пароль"
                      className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {isSubmitted && errors.password && (
                      <span className={styles.errorText}>{errors.password}</span>
                    )}
                  </div>
                  {!isLogin && (
                    <div className={styles.inputWrapper}>
                      <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Повтор пароля"
                        className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
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

                  <button type="submit" className={styles.submitButton}>
                    {isLogin ? "Войти" : "Зарегистрироваться"}
                  </button>
                </form>

                <p className={styles.switchMode}>
                  {isLogin ? "Впервые в ALDA? " : "Уже зарегистрированы?"}
                  <button onClick={() => {
                    setIsLogin(!isLogin);
                    setErrors({});
                    setIsSubmitted(false);
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
                  <span>Установив этот флажок, я подтверждаю согласие с <a href="#">Правилами пользования</a> ALDA.</span>
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
                  <span>Да, я хочу быть в курсе всех новостей и специальных предложений от ALDA.</span>
                </label>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
} 