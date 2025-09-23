'use client';

import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import styles from './ChangePasswordModal.module.css';

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const { getAuthHeaders } = useAuth();
  const [formData, setFormData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    old_password: false,
    new_password: false,
    confirm_password: false
  });

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.old_password) {
      newErrors.old_password = 'Введите текущий пароль';
    }

    if (!formData.new_password) {
      newErrors.new_password = 'Введите новый пароль';
    } else if (formData.new_password.length < 8) {
      newErrors.new_password = 'Пароль должен содержать минимум 8 символов';
    }

    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Подтвердите новый пароль';
    } else if (formData.new_password !== formData.confirm_password) {
      newErrors.confirm_password = 'Пароли не совпадают';
    }

    if (formData.old_password === formData.new_password) {
      newErrors.new_password = 'Новый пароль должен отличаться от текущего';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const headers = getAuthHeaders();
      const response = await fetch('https://aldalinde.ru/api/auth/change-password/', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          old_password: formData.old_password,
          new_password: formData.new_password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Пароль успешно изменен');
        setFormData({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setMessage(data.error || 'Ошибка при изменении пароля');
      }
    } catch (error) {
      setMessage('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      old_password: '',
      new_password: '',
      confirm_password: ''
    });
    setMessage('');
    setErrors({});
    setShowPasswords({
      old_password: false,
      new_password: false,
      confirm_password: false
    });
    onClose();
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal_overlay} onClick={handleClose}>
      <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modal_header}>
          <h2 className={styles.modal_title}>Изменение пароля</h2>
          <button className={styles.modal_close} onClick={handleClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <form className={styles.modal_form} onSubmit={handleSubmit}>
          {message && (
            <div className={`${styles.message} ${message.includes('успешно') ? styles.message_success : styles.message_error}`}>
              {message}
            </div>
          )}

          <div className={styles.form_field}>
            <label className={styles.form_label}>Текущий пароль</label>
            <div className={styles.password_input_container}>
              <input
                type={showPasswords.old_password ? "text" : "password"}
                name="old_password"
                value={formData.old_password}
                onChange={handleChange}
                className={`${styles.form_input} ${errors.old_password ? styles.form_input_error : ''}`}
                placeholder="Введите текущий пароль"
              />
              <button
                type="button"
                className={styles.password_toggle}
                onClick={() => togglePasswordVisibility('old_password')}
              >
                {showPasswords.old_password ? (
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
            {errors.old_password && (
              <span className={styles.form_error}>{errors.old_password}</span>
            )}
          </div>

          <div className={styles.form_field}>
            <label className={styles.form_label}>Новый пароль</label>
            <div className={styles.password_input_container}>
              <input
                type={showPasswords.new_password ? "text" : "password"}
                name="new_password"
                value={formData.new_password}
                onChange={handleChange}
                className={`${styles.form_input} ${errors.new_password ? styles.form_input_error : ''}`}
                placeholder="Введите новый пароль"
              />
              <button
                type="button"
                className={styles.password_toggle}
                onClick={() => togglePasswordVisibility('new_password')}
              >
                {showPasswords.new_password ? (
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
            {errors.new_password && (
              <span className={styles.form_error}>{errors.new_password}</span>
            )}
          </div>

          <div className={styles.form_field}>
            <label className={styles.form_label}>Подтвердите новый пароль</label>
            <div className={styles.password_input_container}>
              <input
                type={showPasswords.confirm_password ? "text" : "password"}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                className={`${styles.form_input} ${errors.confirm_password ? styles.form_input_error : ''}`}
                placeholder="Подтвердите новый пароль"
              />
              <button
                type="button"
                className={styles.password_toggle}
                onClick={() => togglePasswordVisibility('confirm_password')}
              >
                {showPasswords.confirm_password ? (
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
            {errors.confirm_password && (
              <span className={styles.form_error}>{errors.confirm_password}</span>
            )}
          </div>

          <div className={styles.form_actions}>
            <button
              type="submit"
              className={styles.form_submit}
              disabled={isLoading}
            >
              {isLoading ? 'Изменение...' : 'Изменить пароль'}
            </button>
            <button
              type="button"
              className={styles.form_cancel}
              onClick={handleClose}
              disabled={isLoading}
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
