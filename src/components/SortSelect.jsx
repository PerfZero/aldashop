'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './SortSelect.module.css';

export default function SortSelect({ value, onChange, options = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!options || options.length === 0) {
    return null;
  }

  const currentOption = options.find(option => option.id === value) || options[0];

  return (
    <div className={styles.sortSelect} ref={dropdownRef}>
      <span className={styles.sortSelect__label}>Сортировать по:</span>
      <div className={styles.sortSelect__container}>
        <button
          className={styles.sortSelect__button}
          onClick={() => setIsOpen(!isOpen)}
          type="button"
          aria-expanded={isOpen}
        >
          {currentOption?.title}
          <svg 
            className={`${styles.sortSelect__arrow} ${isOpen ? styles.sortSelect__arrow_open : ''}`} 
            width="12" 
            height="8" 
            viewBox="0 0 12 8" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {isOpen && (
          <div className={styles.sortSelect__dropdown}>
            {options.map(option => (
              <button
                key={option.id}
                className={`${styles.sortSelect__option} ${option.id === (currentOption?.id) ? styles.sortSelect__option_active : ''}`}
                onClick={() => {
                  onChange && onChange(option.id);
                  setIsOpen(false);
                }}
                type="button"
              >
                {option.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}