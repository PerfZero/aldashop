'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styles from './LegalModal.module.css';

export default function LegalModal({ isOpen, onClose, title, content, type, pdfUrl }) {
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
      
        <div className={styles.content}>
          {pdfUrl ? (
            <iframe 
              src={pdfUrl} 
              className={styles.pdfViewer}
              title={title}
            />
          ) : (
            <div 
              className={styles.text}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
