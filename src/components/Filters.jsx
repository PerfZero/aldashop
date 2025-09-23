import { useState, useEffect } from 'react';
import FiltersSkeleton from './FiltersSkeleton';
import styles from './Filters.module.css';

export default function Filters({ isVisible, onClose, filters = [], loading = false, error = null, onApply, appliedFilters = {} }) {
  const [inStockDelivery, setInStockDelivery] = useState(appliedFilters.in_stock || false);
  const [tempFilters, setTempFilters] = useState(appliedFilters);
  const [expandedFilters, setExpandedFilters] = useState({});

  const filteredFilters = filters.filter(filter => filter.slug !== 'sort');

  useEffect(() => {
    setInStockDelivery(appliedFilters.in_stock || false);
    setTempFilters(appliedFilters);
  }, [appliedFilters]);

  const toggleFilter = (filterSlug) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterSlug]: !prev[filterSlug]
    }));
  };

  if (!isVisible) return null;

  const handleReset = () => {
    setTempFilters({});
    setInStockDelivery(false);
    
    const resetFilters = {};
    
    if (onApply) {
      onApply(resetFilters);
    }
  };

  const handleCancel = () => {
    onClose();
  };

  const handleApply = () => {
    const finalFilters = {
      ...tempFilters
    };
    
    if (inStockDelivery) {
      finalFilters.in_stock = true;
    }
    
    if (onApply) {
      onApply(finalFilters);
    }
    
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  if (loading) {
    return <FiltersSkeleton onClose={onClose} />;
  }

  if (error) {
    return (
      <div className={styles.filters}>
        <div className={styles.filters__header}>
          <h2 className={styles.filters__title}>Фильтры</h2>
          <button className={styles.filters__close} onClick={onClose}>×</button>
        </div>
        <div className={styles.filters__content}>
          <div className={styles.error}>{error}</div>
        </div>
      </div>
    );
  }

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

        {filteredFilters.map((filter, index) => (
          <div key={index} className={styles.filter}>
            <div className={styles.filter__header} onClick={() => toggleFilter(filter.slug)}>
              <h3 className={styles.filter__title}>{filter.title}</h3>
              <svg 
                className={`${styles.filter__arrow} ${expandedFilters[filter.slug] ? styles.filter__arrow_expanded : ''}`}
                width="8" 
                height="12" 
                viewBox="0 0 8 12" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
              <path d="M1.25 0.5L6.75 6L1.25 11.5" stroke="#323433" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
            
            {expandedFilters[filter.slug] && (
              <>
                {filter.type === 'select' && filter.options && filter.slug !== 'colors' && filter.slug !== 'in_stock' && filter.slug !== 'designer' && (
                  <div className={styles.filter__options}>
                    {filter.options.map((option, optionIndex) => (
                      <label key={optionIndex} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={tempFilters[filter.slug]?.includes(option.id || option.title) || false}
                          onChange={(e) => {
                            const currentValues = tempFilters[filter.slug] || [];
                            const optionValue = option.id || option.title;
                            const newValues = e.target.checked
                              ? [...currentValues, optionValue]
                              : currentValues.filter(val => val !== optionValue);
                            setTempFilters(prev => ({
                              ...prev,
                              [filter.slug]: newValues
                            }));
                          }}
                          className={styles.checkboxInput}
                        />
                        <span className={styles.checkboxText}>{option.title}</span>
                      </label>
                    ))}
                  </div>
                )}

                {filter.type === 'checkbox' && (
                  <div className={styles.filter__checkbox}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={tempFilters[filter.slug] || false}
                        onChange={(e) => setTempFilters(prev => ({
                          ...prev,
                          [filter.slug]: e.target.checked
                        }))}
                        className={styles.checkboxInput}
                      />
                      <span className={styles.checkboxText}>Да</span>
                    </label>
                  </div>
                )}

                {filter.type === 'range' && filter.slug === 'sizes' && (
                  <div className={styles.filter__sizes}>
                    <div className={styles.size__group}>
                      <label className={styles.size__label}>Ширина (см)</label>
                      <div className={styles.range__container}>
                        <div className={styles.range__track}>
                          <div 
                            className={styles.range__progress}
                            style={{
                              left: `${((tempFilters[filter.slug]?.width?.min || filter.min_width || 0) - (filter.min_width || 0)) / ((filter.max_width || 100) - (filter.min_width || 0)) * 100}%`,
                              right: `${100 - ((tempFilters[filter.slug]?.width?.max || filter.max_width || 100) - (filter.min_width || 0)) / ((filter.max_width || 100) - (filter.min_width || 0)) * 100}%`
                            }}
                          ></div>
                          <input
                            type="range"
                            min={filter.min_width || 0}
                            max={filter.max_width || 100}
                            value={tempFilters[filter.slug]?.width?.min || filter.min_width || 0}
                            onChange={(e) => {
                              const minValue = parseInt(e.target.value);
                              const maxValue = tempFilters[filter.slug]?.width?.max || filter.max_width || 100;
                              if (minValue <= maxValue) {
                                setTempFilters(prev => ({
                                  ...prev,
                                  [filter.slug]: { 
                                    ...prev[filter.slug], 
                                    width: { ...prev[filter.slug]?.width, min: minValue }
                                  }
                                }));
                              }
                            }}
                            className={`${styles.range__input} ${styles.range__input_min}`}
                          />
                          <input
                            type="range"
                            min={filter.min_width || 0}
                            max={filter.max_width || 100}
                            value={tempFilters[filter.slug]?.width?.max || filter.max_width || 100}
                            onChange={(e) => {
                              const maxValue = parseInt(e.target.value);
                              const minValue = tempFilters[filter.slug]?.width?.min || filter.min_width || 0;
                              if (maxValue >= minValue) {
                                setTempFilters(prev => ({
                                  ...prev,
                                  [filter.slug]: { 
                                    ...prev[filter.slug], 
                                    width: { ...prev[filter.slug]?.width, max: maxValue }
                                  }
                                }));
                              }
                            }}
                            className={`${styles.range__input} ${styles.range__input_max}`}
                          />
                        </div>
                        <div className={styles.range__values}>
                          <span>{tempFilters[filter.slug]?.width?.min || filter.min_width || 0} см</span>
                          <span>{tempFilters[filter.slug]?.width?.max || filter.max_width || 100} см</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.size__group}>
                      <label className={styles.size__label}>Высота (см)</label>
                      <div className={styles.range__container}>
                        <div className={styles.range__track}>
                          <div 
                            className={styles.range__progress}
                            style={{
                              left: `${((tempFilters[filter.slug]?.height?.min || filter.min_height || 0) - (filter.min_height || 0)) / ((filter.max_height || 100) - (filter.min_height || 0)) * 100}%`,
                              right: `${100 - ((tempFilters[filter.slug]?.height?.max || filter.max_height || 100) - (filter.min_height || 0)) / ((filter.max_height || 100) - (filter.min_height || 0)) * 100}%`
                            }}
                          ></div>
                          <input
                            type="range"
                            min={filter.min_height || 0}
                            max={filter.max_height || 100}
                            value={tempFilters[filter.slug]?.height?.min || filter.min_height || 0}
                            onChange={(e) => {
                              const minValue = parseInt(e.target.value);
                              const maxValue = tempFilters[filter.slug]?.height?.max || filter.max_height || 100;
                              if (minValue <= maxValue) {
                                setTempFilters(prev => ({
                                  ...prev,
                                  [filter.slug]: { 
                                    ...prev[filter.slug], 
                                    height: { ...prev[filter.slug]?.height, min: minValue }
                                  }
                                }));
                              }
                            }}
                            className={`${styles.range__input} ${styles.range__input_min}`}
                          />
                          <input
                            type="range"
                            min={filter.min_height || 0}
                            max={filter.max_height || 100}
                            value={tempFilters[filter.slug]?.height?.max || filter.max_height || 100}
                            onChange={(e) => {
                              const maxValue = parseInt(e.target.value);
                              const minValue = tempFilters[filter.slug]?.height?.min || filter.min_height || 0;
                              if (maxValue >= minValue) {
                                setTempFilters(prev => ({
                                  ...prev,
                                  [filter.slug]: { 
                                    ...prev[filter.slug], 
                                    height: { ...prev[filter.slug]?.height, max: maxValue }
                                  }
                                }));
                              }
                            }}
                            className={`${styles.range__input} ${styles.range__input_max}`}
                          />
                        </div>
                        <div className={styles.range__values}>
                          <span>{tempFilters[filter.slug]?.height?.min || filter.min_height || 0} см</span>
                          <span>{tempFilters[filter.slug]?.height?.max || filter.max_height || 100} см</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.size__group}>
                      <label className={styles.size__label}>Глубина (см)</label>
                      <div className={styles.range__container}>
                        <div className={styles.range__track}>
                          <div 
                            className={styles.range__progress}
                            style={{
                              left: `${((tempFilters[filter.slug]?.depth?.min || filter.min_depth || 0) - (filter.min_depth || 0)) / ((filter.max_depth || 100) - (filter.min_depth || 0)) * 100}%`,
                              right: `${100 - ((tempFilters[filter.slug]?.depth?.max || filter.max_depth || 100) - (filter.min_depth || 0)) / ((filter.max_depth || 100) - (filter.min_depth || 0)) * 100}%`
                            }}
                          ></div>
                          <input
                            type="range"
                            min={filter.min_depth || 0}
                            max={filter.max_depth || 100}
                            value={tempFilters[filter.slug]?.depth?.min || filter.min_depth || 0}
                            onChange={(e) => {
                              const minValue = parseInt(e.target.value);
                              const maxValue = tempFilters[filter.slug]?.depth?.max || filter.max_depth || 100;
                              if (minValue <= maxValue) {
                                setTempFilters(prev => ({
                                  ...prev,
                                  [filter.slug]: { 
                                    ...prev[filter.slug], 
                                    depth: { ...prev[filter.slug]?.depth, min: minValue }
                                  }
                                }));
                              }
                            }}
                            className={`${styles.range__input} ${styles.range__input_min}`}
                          />
                          <input
                            type="range"
                            min={filter.min_depth || 0}
                            max={filter.max_depth || 100}
                            value={tempFilters[filter.slug]?.depth?.max || filter.max_depth || 100}
                            onChange={(e) => {
                              const maxValue = parseInt(e.target.value);
                              const minValue = tempFilters[filter.slug]?.depth?.min || filter.min_depth || 0;
                              if (maxValue >= minValue) {
                                setTempFilters(prev => ({
                                  ...prev,
                                  [filter.slug]: { 
                                    ...prev[filter.slug], 
                                    depth: { ...prev[filter.slug]?.depth, max: maxValue }
                                  }
                                }));
                              }
                            }}
                            className={`${styles.range__input} ${styles.range__input_max}`}
                          />
                        </div>
                        <div className={styles.range__values}>
                          <span>{tempFilters[filter.slug]?.depth?.min || filter.min_depth || 0} см</span>
                          <span>{tempFilters[filter.slug]?.depth?.max || filter.max_depth || 100} см</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {filter.type === 'range' && filter.slug === 'price' && (
                  <div className={styles.filter__range}>
                    <div className={styles.range__container}>
                      <div className={styles.range__track}>
                        <div 
                          className={styles.range__progress}
                          style={{
                            left: `${((tempFilters[filter.slug]?.min || filter.min || 0) - (filter.min || 0)) / ((filter.max || 100000) - (filter.min || 0)) * 100}%`,
                            right: `${100 - ((tempFilters[filter.slug]?.max || filter.max || 100000) - (filter.min || 0)) / ((filter.max || 100000) - (filter.min || 0)) * 100}%`
                          }}
                        ></div>
                        <input
                          type="range"
                          min={filter.min || 0}
                          max={filter.max || 100000}
                          value={tempFilters[filter.slug]?.min || filter.min || 0}
                          onChange={(e) => {
                            const minValue = parseInt(e.target.value);
                            const maxValue = tempFilters[filter.slug]?.max || filter.max || 100000;
                            if (minValue <= maxValue) {
                              setTempFilters(prev => ({
                                ...prev,
                                [filter.slug]: { ...prev[filter.slug], min: minValue }
                              }));
                            }
                          }}
                          className={`${styles.range__input} ${styles.range__input_min}`}
                        />
                        <input
                          type="range"
                          min={filter.min || 0}
                          max={filter.max || 100000}
                          value={tempFilters[filter.slug]?.max || filter.max || 100000}
                          onChange={(e) => {
                            const maxValue = parseInt(e.target.value);
                            const minValue = tempFilters[filter.slug]?.min || filter.min || 0;
                            if (maxValue >= minValue) {
                              setTempFilters(prev => ({
                                ...prev,
                                [filter.slug]: { ...prev[filter.slug], max: maxValue }
                              }));
                            }
                          }}
                          className={`${styles.range__input} ${styles.range__input_max}`}
                        />
                      </div>
                      <div className={styles.range__values}>
                        <span>{tempFilters[filter.slug]?.min || filter.min || 0} ₽</span>
                        <span>{tempFilters[filter.slug]?.max || filter.max || 100000} ₽</span>
                      </div>
                    </div>
                  </div>
                )}

                {filter.type === 'select' && filter.slug === 'colors' && (
                  <div className={styles.filter__colors}>
                    {filter.options?.map((color, colorIndex) => (
                      <button
                        key={colorIndex}
                        className={`${styles.colorOption} ${
                          tempFilters[filter.slug]?.includes(color.id) ? styles.colorOptionActive : ''
                        }`}
                        style={{ backgroundColor: `#${color.code_hex}` }}
                        onClick={() => {
                          const currentValues = tempFilters[filter.slug] || [];
                          const newValues = currentValues.includes(color.id)
                            ? currentValues.filter(val => val !== color.id)
                            : [...currentValues, color.id];
                          setTempFilters(prev => ({
                            ...prev,
                            [filter.slug]: newValues
                          }));
                        }}
                        title={color.title}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        {filteredFilters.length === 0 && (
          <div className={styles.noFilters}>
            Нет доступных фильтров
          </div>
        )}
      </div>

      <div className={styles.filters__footer}>
        <button 
          className={`${styles.filters__button} ${styles.filters__button_cancel}`}
          onClick={handleReset}
        >
          Сброс
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