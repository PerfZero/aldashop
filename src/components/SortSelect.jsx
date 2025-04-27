'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './SortSelect.module.css';

const options = [
  { value: 'recommended', label: 'Рекомендации' },
  { value: 'price-asc', label: 'Ниже цена' },
  { value: 'price-desc', label: 'Выше цена' }
];

export default function SortSelect({ value, onChange }) {
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

  const currentOption = options.find(option => option.value === value) || options[0];

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
          {currentOption.label}
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
                key={option.value}
                className={`${styles.sortSelect__option} ${option.value === value ? styles.sortSelect__option_active : ''}`}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}