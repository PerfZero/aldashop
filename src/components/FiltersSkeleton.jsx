import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import styles from './Filters.module.css';

export default function FiltersSkeleton({ onClose }) {
  return (
    <div className={styles.filters}>
      <div className={styles.filters__header}>
        <h2 className={styles.filters__title}>Фильтры</h2>
        <button className={styles.filters__close} onClick={onClose}>×</button>
      </div>
      <div className={styles.filters__content}>
        {/* Скелетон для ценового фильтра */}
        <div className={styles.filters__group}>
          <Skeleton height={20} width={80} style={{ marginBottom: '12px' }} />
          <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <Skeleton height={40} width="45%" />
            <Skeleton height={40} width="45%" />
          </div>
        </div>
        
        {/* Скелетоны для других фильтров */}
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className={styles.filters__group}>
            <Skeleton height={20} width="60%" style={{ marginBottom: '12px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {Array.from({ length: 3 }).map((_, optionIndex) => (
                <div key={optionIndex} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Skeleton height={16} width={16} />
                  <Skeleton height={16} width="70%" />
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Скелетон для кнопок */}
        <div className={styles.filters__actions}>
          <Skeleton height={40} width="48%" />
          <Skeleton height={40} width="48%" />
        </div>
      </div>
    </div>
  );
}
