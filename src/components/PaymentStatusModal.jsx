'use client';

import styles from './PaymentStatusModal.module.css';

const PaymentStatusModal = ({ isOpen, onClose, isSuccess }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modal_overlay} onClick={onClose}>
      <div className={styles.modal_content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modal_header}>
          <h2 className={styles.modal_title}>
            {isSuccess ? 'Оплата успешна' : 'Ошибка оплаты'}
          </h2>
          <button className={styles.modal_close} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className={styles.modal_body}>
          <div className={`${styles.status_icon} ${isSuccess ? styles.status_icon_success : styles.status_icon_error}`}>
            {isSuccess ? (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <p className={styles.status_message}>
            {isSuccess 
              ? 'Ваш заказ успешно оплачен. Мы свяжемся с вами в ближайшее время.'
              : 'Произошла ошибка при оплате. Пожалуйста, попробуйте еще раз или свяжитесь с поддержкой.'}
          </p>
        </div>

        <div className={styles.modal_actions}>
          <button className={styles.modal_button} onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusModal;
