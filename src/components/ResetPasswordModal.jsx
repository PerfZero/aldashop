"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './ResetPasswordModal.module.css';

export default function ResetPasswordModal({ isOpen, onClose }) {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('form');
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const uidb64 = searchParams.get('uidb64');
  const token = searchParams.get('token');

  useEffect(() => {
    if (!uidb64 || !token) {
      setStatus('error');
      setMessage('Неверная ссылка для сброса пароля');
    }
  }, [uidb64, token]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.new_password) {
      newErrors.new_password = 'Введите новый пароль';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Пароль должен быть не менее 8 символов';
    }
    
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Подтвердите новый пароль';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Пароли не совпадают';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    if (!validateForm()) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/auth/reset-password-confirm/${uidb64}/${token}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          new_password: formData.new_password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.detail || 'Пароль успешно изменен!');
      } else {
        setStatus('error');
        setMessage(data.error || data.detail || 'Ошибка при сбросе пароля');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Произошла ошибка при сбросе пароля');
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
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
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
          {status === 'form' && (
            <div className={styles.form}>
              <h2>Создание нового пароля</h2>
              <p>Введите новый пароль для вашего аккаунта</p>
              
              <form onSubmit={handleSubmit}>
                <div className={styles.inputGroup}>
                  <label htmlFor="new_password">Новый пароль</label>
                  <input
                    type="password"
                    id="new_password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    className={errors.new_password ? styles.error : ''}
                    placeholder="Минимум 8 символов"
                  />
                  {errors.new_password && (
                    <span className={styles.errorText}>{errors.new_password}</span>
                  )}
                </div>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="confirm_password">Подтвердите пароль</label>
                  <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className={errors.confirm_password ? styles.error : ''}
                    placeholder="Повторите пароль"
                  />
                  {errors.confirm_password && (
                    <span className={styles.errorText}>{errors.confirm_password}</span>
                  )}
                </div>
                
                <button 
                  type="submit" 
                  className={styles.primaryButton}
                  disabled={isLoading}
                >
                  {isLoading ? 'Сохранение...' : 'Сохранить пароль'}
                </button>
              </form>
            </div>
          )}
          
          {status === 'success' && (
            <div className={styles.success}>
              <div className={styles.successIcon}>✓</div>
              <h2>Пароль изменен!</h2>
              <p>{message}</p>
              <button className={styles.primaryButton} onClick={onClose}>
                Войти в аккаунт
              </button>
            </div>
          )}
          
          {status === 'error' && (
            <div className={styles.error}>
              <div className={styles.errorIcon}>✕</div>
              <h2>Ошибка</h2>
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

