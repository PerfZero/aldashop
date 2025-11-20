
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import FiltersSkeleton from './FiltersSkeleton';
import styles from './Filters.module.css';

export default function Filters({ isVisible, onClose, filters = [], loading = false, error = null, onApply, appliedFilters = {}, categories = [] }) {
  const pathname = usePathname();
  const [inStockDelivery, setInStockDelivery] = useState(() => appliedFilters.in_stock === true);
  const [tempFilters, setTempFilters] = useState(appliedFilters);
  const [expandedFilters, setExpandedFilters] = useState({});
  const [expandedCategories, setExpandedCategories] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('expandedCategories');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Error parsing expandedCategories:', e);
        }
      }
    }
    return { categories: true };
  });

  const filteredFilters = filters.filter(filter => filter.slug !== 'sort' && filter.slug !== 'in_stock');

  useEffect(() => {
    setInStockDelivery(appliedFilters.in_stock === true);
    setTempFilters(appliedFilters);
  }, [appliedFilters]);

  useEffect(() => {
    const saved = sessionStorage.getItem('expandedFilters');
    if (saved) {
      try {
        setExpandedFilters(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing expandedFilters:', e);
      }
    }
  }, []);

  const toggleFilter = (filterSlug) => {
    setExpandedFilters(prev => {
      const newState = {
        ...prev,
        [filterSlug]: !prev[filterSlug]
      };
      
      sessionStorage.setItem('expandedFilters', JSON.stringify(newState));
      
      return newState;
    });
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newState = {
        ...prev,
        [categoryId]: !prev[categoryId]
      };
      
      sessionStorage.setItem('expandedCategories', JSON.stringify(newState));
      
      return newState;
    });
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
    const finalFilters = { ...tempFilters };
    
    if (inStockDelivery) {
      finalFilters.in_stock = true;
    } else {
      delete finalFilters.in_stock;
    }
    
    const priceFilter = filters.find(f => f.slug === 'price' && f.type === 'range');
    if (priceFilter) {
      const displayedMin = tempFilters.price?.min !== undefined ? tempFilters.price.min : (priceFilter.min || 0);
      const displayedMax = tempFilters.price?.max !== undefined ? tempFilters.price.max : (priceFilter.max || 100000);
      
      finalFilters.price = {
        min: displayedMin,
        max: displayedMax
      };
    }
    
    Object.keys(finalFilters).forEach(key => {
      if (finalFilters[key] === '' || finalFilters[key] === undefined || finalFilters[key] === null) {
        delete finalFilters[key];
      }
      if (finalFilters[key] && typeof finalFilters[key] === 'object' && Object.keys(finalFilters[key]).length === 0) {
        delete finalFilters[key];
      }
    });
    
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
    <div className={`${styles.filters} ${isVisible ? styles.visible : ''}`}>
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
              onChange={() => {
                setInStockDelivery(!inStockDelivery);
              }}
              className={styles.toggleInput}
            />
            <span className={styles.toggleSwitch}></span>
            <span className={styles.toggleText}>В наличии</span>
          </label>
        </div>

        {categories && categories.length > 0 && (
          <div className={styles.filter}>
            <div className={styles.filter__header} onClick={() => toggleCategory('categories')}>
              <svg 
                className={`${styles.filter__arrow} ${expandedCategories.categories ? styles.filter__arrow_expanded : ''}`}
                width="16" 
                height="10" 
                viewBox="0 0 16 10" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13 2.25L7.5 7.75L2 2.25" stroke="#323433" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 className={styles.filter__title}>Категории</h3>
            </div>
            {expandedCategories.categories && (() => {
              const sortedCategories = [...categories].sort((a, b) => {
                const aIsActive = pathname === `/categories/${a.slug}` || pathname?.startsWith(`/categories/${a.slug}/`);
                const bIsActive = pathname === `/categories/${b.slug}` || pathname?.startsWith(`/categories/${b.slug}/`);
                if (aIsActive && !bIsActive) return -1;
                if (!aIsActive && bIsActive) return 1;
                return 0;
              });

              return (
                <div className={styles.filter__options}>
                  {sortedCategories.map((category, index) => {
                    const isActive = pathname === `/categories/${category.slug}` || pathname?.startsWith(`/categories/${category.slug}/`);
                    return (
                      <div key={category.id}>
                        <div 
                          className={`${styles.category__header} ${isActive ? styles.category__header_active : ''}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleCategory(`category-${category.id}`);
                          }}
                        >
                          <svg 
                            className={`${styles.category__arrow} ${expandedCategories[`category-${category.id}`] ? styles.category__arrow_expanded : ''}`}
                            width="16" 
                            height="10" 
                            viewBox="0 0 16 10" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M13 2.25L7.5 7.75L2 2.25" stroke="#323433" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className={styles.category__title}>{category.title}</span>
                        </div>
                        {expandedCategories[`category-${category.id}`] && category.subcategories && category.subcategories.length > 0 && (
                          <div className={styles.category__subcategories}>
                            {category.subcategories.map((subcategory) => {
                              const href = `/categories/${category.slug}/${subcategory.slug}`;
                              const isSubActive = pathname === href;
                              return (
                                <Link 
                                  key={subcategory.id} 
                                  href={href}
                                  scroll={false}
                                  className={`${styles.category__link} ${isSubActive ? styles.category__link_active : ''}`}
                                  onClick={() => {
                                    console.log('[Filters] Клик по подкатегории в фильтрах:', { categoryId: category.id, subcategoryId: subcategory.id, href });
                                  }}
                                >
                                  {subcategory.title}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                        {isActive && index < sortedCategories.length - 1 && (
                          <div className={styles.category__divider}></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {filteredFilters.map((filter, index) => (
          <div key={index} className={styles.filter}>
            <div className={styles.filter__header} onClick={() => toggleFilter(filter.slug)}>
              <svg 
                className={`${styles.filter__arrow} ${expandedFilters[filter.slug] ? styles.filter__arrow_expanded : ''}`}
                width="16" 
                height="10" 
                viewBox="0 0 16 10" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M13 2.25L7.5 7.75L2 2.25" stroke="#323433" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <h3 className={styles.filter__title}>{filter.title}</h3>
          </div>
            
            {expandedFilters[filter.slug] && (
              <>
                {filter.type === 'select' && filter.options && filter.slug !== 'colors' && filter.slug !== 'in_stock' && filter.slug !== 'designer' && (
                  <div className={styles.filter__options}>
                    {filter.options.map((option, optionIndex) => (
                      <label key={optionIndex} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={tempFilters[filter.slug]?.includes(option.id) || false}
                          onChange={(e) => {
                            const currentValues = tempFilters[filter.slug] || [];
                            const newValues = e.target.checked
                              ? [...currentValues, option.id]
                              : currentValues.filter(val => val !== option.id);
                            setTempFilters(prev => ({
                              ...prev,
                              [filter.slug]: newValues.length > 0 ? newValues : undefined
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
          type="button"
          className={`${styles.filters__button} ${styles.filters__button_cancel}`}
          onClick={handleReset}
        >
          Сброс
        </button>
        <button 
          type="button"
          className={`${styles.filters__button} ${styles.filters__button_apply}`}
          onClick={handleApply}
        >
          Применить
        </button>
      </div>
    </div>
  );
}