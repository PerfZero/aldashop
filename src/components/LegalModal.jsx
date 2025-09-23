'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './LegalModal.module.css';

export default function LegalModal({ isOpen, onClose, title, content, type }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.5 0.5L15.5 15.5M15.5 0.5L0.5 15.5" stroke="#C1AF86" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className={styles.content}>
          <div 
            className={styles.text}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
