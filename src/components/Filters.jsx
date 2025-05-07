import { useState } from 'react';
import styles from './Filters.module.css';

export default function Filters({ isVisible, onClose }) {
  const [showAllFilters, setShowAllFilters] = useState(false);
  const [inStockDelivery, setInStockDelivery] = useState(false);
  const [tempFilters, setTempFilters] = useState({});

  const mainFilters = [
    { title: 'Порядок', type: 'checkbox' },
    { title: 'Цена', type: 'range' },
    { title: 'Размер', type: 'select' },
    { title: 'Популярные цвета', type: 'colors' },
    { title: 'Материал обивки', type: 'select' },
    { title: 'Раскладной', type: 'checkbox' },
    { title: 'Размер спального места', type: 'select' },
  ];

  const additionalFilters = [
    { title: 'Назначение', type: 'select' },
    { title: 'Цвета', type: 'colors' },
    { title: 'Форма', type: 'select' },
    { title: 'С ящиками', type: 'checkbox' },
    { title: 'Материалы', type: 'select' },
    { title: 'Бренды', type: 'select' },
    { title: 'Страна производитель', type: 'select' },
  ];

  if (!isVisible) return null;

  const handleCancel = () => {
    setTempFilters({});
    onClose();
  };

  const handleApply = () => {
    // Здесь можно добавить логику применения фильтров
    onClose();
  };

  return (
    <div className={styles.filters}>
      <div className={styles.filters__header}>
        <h2 className={styles.filters__title}>Фильтры</h2>
        <button className={styles.filters__close} onClick={onClose}>×</button>
      </div>
      
      <div className={styles.filters__content}>
        <div className={styles.filter}>
          <label className={styles.toggleLabel}>
            <input
              type="checkbox"
              checked={inStockDelivery}
              onChange={() => setInStockDelivery(!inStockDelivery)}
              className={styles.toggleInput}
            />
            <span className={styles.toggleSwitch}></span>
            <span className={styles.toggleText}>В наличии</span>
          </label>
        </div>

        {mainFilters.map((filter, index) => (
          <div key={index} className={styles.filter}>
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.25 0.5L6.75 6L1.25 11.5" stroke="#323433" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className={styles.filter__title}>{filter.title}</h3>
            {/* Здесь будет компонент фильтра в зависимости от типа */}
          </div>
        ))}

        {showAllFilters && additionalFilters.map((filter, index) => (
          <div key={index} className={styles.filter}>
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1.25 0.5L6.75 6L1.25 11.5" stroke="#323433" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h3 className={styles.filter__title}>{filter.title}</h3>
            {/* Здесь будет компонент фильтра в зависимости от типа */}
          </div>
        ))}

        <button 
          className={styles.filters__toggle}
          onClick={() => setShowAllFilters(!showAllFilters)}
        >
          {showAllFilters ? 'Скрыть' : 'Показать все фильтры'}
        </button>
      </div>

      <div className={styles.filters__footer}>
        <button 
          className={`${styles.filters__button} ${styles.filters__button_cancel}`}
          onClick={handleCancel}
        >
          Отменить
        </button>
        <button 
          className={`${styles.filters__button} ${styles.filters__button_apply}`}
          onClick={handleApply}
        >
          Применить
        </button>
      </div>
    </div>
  );
}