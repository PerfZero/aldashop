import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import RangeSlider from "./RangeSlider";
import FiltersSkeleton from "./FiltersSkeleton";
import styles from "./Filters.module.css";

export default function Filters({
  isVisible,
  onClose,
  filters = [],
  loading = false,
  error = null,
  onApply,
  onPreviewChange,
  appliedFilters = {},
  categories = [],
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCategoriesPage = pathname === "/categories";
  const isCategorySlugPage =
    pathname?.startsWith("/categories/") && pathname !== "/categories";
  const hasFlagType = searchParams.get("flag_type");
  const clearCategoryContextQuery = (url) => {
    const keysToKeep = new Set(["category_id", "subcategory_id", "flag_type"]);
    for (const key of Array.from(url.searchParams.keys())) {
      if (!keysToKeep.has(key)) {
        url.searchParams.delete(key);
      }
    }
  };
  const [inStockDelivery, setInStockDelivery] = useState(
    () => appliedFilters.in_stock === true,
  );
  const [tempFilters, setTempFilters] = useState(appliedFilters);
  const [expandedFilters, setExpandedFilters] = useState({});
  const [expandedCategories, setExpandedCategories] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("expandedCategories");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing expandedCategories:", e);
        }
      }
    }
    return { categories: true };
  });

  useEffect(() => {
    if (typeof document === "undefined") return;

    const shouldLockScroll = isVisible && window.innerWidth <= 768;
    if (shouldLockScroll) {
      const scrollY = window.scrollY || 0;
      document.body.dataset.scrollLock = String(scrollY);
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
    } else {
      const scrollY = parseInt(document.body.dataset.scrollLock || "0", 10);
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      if (scrollY) {
        window.scrollTo(0, scrollY);
      }
      delete document.body.dataset.scrollLock;
    }
  }, [isVisible]);

  const filteredFilters = useMemo(() => {
    return filters.filter(
      (filter) => filter.slug !== "sort" && filter.slug !== "in_stock",
    );
  }, [filters]);

  const filterKeys = useMemo(() => {
    return filteredFilters
      .map((f) => f.slug)
      .sort()
      .join(",");
  }, [filteredFilters]);

  useEffect(() => {
    setInStockDelivery(appliedFilters.in_stock === true);
    setTempFilters(appliedFilters);
  }, [appliedFilters]);

  useEffect(() => {
    const newExpandedFilters = {};
    filteredFilters.forEach((filter) => {
      newExpandedFilters[filter.slug] = true;
    });
    setExpandedFilters((prev) => {
      const prevKeys = Object.keys(prev).sort().join(",");
      const newKeys = Object.keys(newExpandedFilters).sort().join(",");
      if (prevKeys === newKeys) {
        return prev;
      }
      return newExpandedFilters;
    });
  }, [filterKeys, filteredFilters]);

  useEffect(() => {
    if (isCategoriesPage && categories.length > 0) {
      const categoryIdFromUrl = searchParams.get("category_id");
      if (categoryIdFromUrl) {
        setExpandedCategories((prev) => ({
          ...prev,
          categories: true,
          [`category-${categoryIdFromUrl}`]: true,
        }));
      }
    }
  }, [isCategoriesPage, categories, searchParams]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) => {
      const newState = {
        ...prev,
        [categoryId]: !prev[categoryId],
      };

      sessionStorage.setItem("expandedCategories", JSON.stringify(newState));

      return newState;
    });
  };

  const handleReset = () => {
    setTempFilters({});

    const resetFilters = {};

    if (inStockDelivery) {
      resetFilters.in_stock = true;
    }

    if (onApply) {
      onApply(resetFilters);
    }
  };

  const handleCancel = () => {
    if (onPreviewChange) {
      onPreviewChange(null);
    }
    onClose();
  };

  const buildFinalFilters = useCallback(() => {
    const finalFilters = { ...tempFilters };

    if (inStockDelivery) {
      finalFilters.in_stock = true;
    } else {
      delete finalFilters.in_stock;
    }

    const priceFilter = filters.find(
      (f) => f.slug === "price" && f.type === "range",
    );
    if (priceFilter) {
      const displayedMin =
        tempFilters.price?.min !== undefined
          ? tempFilters.price.min
          : priceFilter.min || 0;
      const displayedMax =
        tempFilters.price?.max !== undefined
          ? tempFilters.price.max
          : priceFilter.max || 100000;

      finalFilters.price = {
        min: displayedMin,
        max: displayedMax,
      };
    }

    Object.keys(finalFilters).forEach((key) => {
      if (
        finalFilters[key] === "" ||
        finalFilters[key] === undefined ||
        finalFilters[key] === null
      ) {
        delete finalFilters[key];
      }
      if (
        finalFilters[key] &&
        typeof finalFilters[key] === "object" &&
        Object.keys(finalFilters[key]).length === 0
      ) {
        delete finalFilters[key];
      }
    });

    return finalFilters;
  }, [tempFilters, inStockDelivery, filters]);

  const prevPreviewRef = useRef(null);
  useEffect(() => {
    if (!onPreviewChange) {
      return;
    }

    const newFilters = buildFinalFilters();
    const newStr = JSON.stringify(newFilters);
    if (prevPreviewRef.current === newStr) return;
    prevPreviewRef.current = newStr;
    onPreviewChange(newFilters);
  }, [onPreviewChange, buildFinalFilters]);

  useEffect(() => {
    if (!isVisible && onPreviewChange) {
      onPreviewChange(null);
    }
  }, [isVisible, onPreviewChange]);

  const handleApply = () => {
    const finalFilters = buildFinalFilters();

    if (onApply) {
      onApply(finalFilters);
    }

    if (onPreviewChange) {
      onPreviewChange(null);
    }

    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  if (!isVisible) return null;

  if (loading) {
    return <FiltersSkeleton onClose={onClose} />;
  }

  if (error) {
    return (
      <div className={styles.filters}>
        <div className={styles.filters__header}>
          <h2 className={styles.filters__title}>Фильтры</h2>
          <button className={styles.filters__close} onClick={handleCancel}>
            ×
          </button>
        </div>
        <div className={styles.filters__content}>
          <div className={styles.error}>{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.filters} ${isVisible ? styles.visible : ""}`}>
      <div className={styles.filters__header}>
        <h2 className={styles.filters__title}>Фильтры</h2>
        <button className={styles.filters__close} onClick={handleCancel}>
          ×
        </button>
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

        {categories &&
          categories.length > 0 &&
          !isCategorySlugPage &&
          !hasFlagType && (
            <div className={styles.filter}>
              <div
                className={styles.filter__header}
                onClick={() => toggleCategory("categories")}
              >
                <svg
                  className={`${styles.filter__arrow} ${expandedCategories.categories ? styles.filter__arrow_expanded : ""}`}
                  width="16"
                  height="10"
                  viewBox="0 0 16 10"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13 2.25L7.5 7.75L2 2.25"
                    stroke="#323433"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3 className={styles.filter__title}>Категории</h3>
              </div>
              {expandedCategories.categories &&
                (() => {
                  const sortedCategories = [...categories].sort((a, b) => {
                    const aIsActive =
                      pathname === `/categories/${a.slug}` ||
                      pathname?.startsWith(`/categories/${a.slug}/`);
                    const bIsActive =
                      pathname === `/categories/${b.slug}` ||
                      pathname?.startsWith(`/categories/${b.slug}/`);
                    if (aIsActive && !bIsActive) return -1;
                    if (!aIsActive && bIsActive) return 1;
                    return 0;
                  });

                  return (
                    <div className={styles.filter__options}>
                      {sortedCategories.map((category, index) => {
                        const isActive = isCategoriesPage
                          ? searchParams.get("category_id") ===
                            String(category.id)
                          : pathname === `/categories/${category.slug}` ||
                            pathname?.startsWith(
                              `/categories/${category.slug}/`,
                            );
                        return (
                          <div key={category.id}>
                            <div
                              className={`${styles.category__header} ${isActive ? styles.category__header_active : ""}`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                if (isCategoriesPage) {
                                  const url = new URL(window.location.href);
                                  clearCategoryContextQuery(url);
                                  if (
                                    searchParams.get("category_id") ===
                                    String(category.id)
                                  ) {
                                    url.searchParams.delete("category_id");
                                    url.searchParams.delete("subcategory_id");
                                  } else {
                                    url.searchParams.set(
                                      "category_id",
                                      String(category.id),
                                    );
                                    url.searchParams.delete("subcategory_id");
                                  }
                                  router.push(url.pathname + url.search, {
                                    scroll: false,
                                  });
                                  if (
                                    category.subcategories &&
                                    category.subcategories.length > 0
                                  ) {
                                    toggleCategory(`category-${category.id}`);
                                  }
                                } else {
                                  toggleCategory(`category-${category.id}`);
                                }
                              }}
                            >
                              <svg
                                className={`${styles.category__arrow} ${expandedCategories[`category-${category.id}`] ? styles.category__arrow_expanded : ""}`}
                                width="16"
                                height="10"
                                viewBox="0 0 16 10"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M13 2.25L7.5 7.75L2 2.25"
                                  stroke="#323433"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <span className={styles.category__title}>
                                {category.title}
                              </span>
                            </div>
                            {expandedCategories[`category-${category.id}`] &&
                              category.subcategories &&
                              category.subcategories.length > 0 && (
                                <div className={styles.category__subcategories}>
                                  {category.subcategories.map((subcategory) => {
                                    const href = `/categories/${category.slug}/${subcategory.slug}`;
                                    const isSubActive = isCategoriesPage
                                      ? searchParams.get("category_id") ===
                                          String(category.id) &&
                                        searchParams.get("subcategory_id") ===
                                          String(subcategory.id)
                                      : pathname === href;

                                    if (isCategoriesPage) {
                                      return (
                                        <button
                                          key={subcategory.id}
                                          className={`${styles.category__link} ${isSubActive ? styles.category__link_active : ""}`}
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const url = new URL(
                                              window.location.href,
                                            );
                                            clearCategoryContextQuery(url);
                                            if (isSubActive) {
                                              url.searchParams.delete(
                                                "category_id",
                                              );
                                              url.searchParams.delete(
                                                "subcategory_id",
                                              );
                                            } else {
                                              url.searchParams.set(
                                                "category_id",
                                                String(category.id),
                                              );
                                              url.searchParams.set(
                                                "subcategory_id",
                                                String(subcategory.id),
                                              );
                                            }
                                            router.push(
                                              url.pathname + url.search,
                                              { scroll: false },
                                            );
                                          }}
                                        >
                                          {subcategory.title}
                                        </button>
                                      );
                                    }

                                    return (
                                      <Link
                                        key={subcategory.id}
                                        href={href}
                                        scroll={false}
                                        className={`${styles.category__link} ${isSubActive ? styles.category__link_active : ""}`}
                                        onClick={() => {
                                          console.log(
                                            "[Filters] Клик по подкатегории в фильтрах:",
                                            {
                                              categoryId: category.id,
                                              subcategoryId: subcategory.id,
                                              href,
                                            },
                                          );
                                        }}
                                      >
                                        {subcategory.title}
                                      </Link>
                                    );
                                  })}
                                </div>
                              )}
                            {isActive &&
                              index < sortedCategories.length - 1 && (
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
            <div
              className={styles.filter__header}
              onClick={() => {
                setExpandedFilters((prev) => ({
                  ...prev,
                  [filter.slug]: !prev[filter.slug],
                }));
              }}
            >
              <svg
                className={`${styles.filter__arrow} ${expandedFilters[filter.slug] ? styles.filter__arrow_expanded : ""}`}
                width="16"
                height="10"
                viewBox="0 0 16 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 2.25L7.5 7.75L2 2.25"
                  stroke="#323433"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h3 className={styles.filter__title}>{filter.title}</h3>
            </div>

            {expandedFilters[filter.slug] && (
              <>
                {filter.type === "select" &&
                  filter.options &&
                  filter.slug !== "colors" &&
                  filter.slug !== "in_stock" &&
                  filter.slug !== "designer" && (
                    <div className={styles.filter__options}>
                      {filter.options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className={styles.checkboxLabel}
                        >
                          <input
                            type="checkbox"
                            checked={
                              tempFilters[filter.slug]?.includes(option.id) ||
                              false
                            }
                            onChange={(e) => {
                              const currentValues =
                                tempFilters[filter.slug] || [];
                              const newValues = e.target.checked
                                ? [...currentValues, option.id]
                                : currentValues.filter(
                                    (val) => val !== option.id,
                                  );
                              setTempFilters((prev) => ({
                                ...prev,
                                [filter.slug]:
                                  newValues.length > 0 ? newValues : undefined,
                              }));
                            }}
                            className={styles.checkboxInput}
                          />
                          <span className={styles.checkboxText}>
                            {option.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}

                {filter.type === "checkbox" && (
                  <div className={styles.filter__checkbox}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={tempFilters[filter.slug] || false}
                        onChange={(e) =>
                          setTempFilters((prev) => ({
                            ...prev,
                            [filter.slug]: e.target.checked,
                          }))
                        }
                        className={styles.checkboxInput}
                      />
                      <span className={styles.checkboxText}>Да</span>
                    </label>
                  </div>
                )}

                {filter.type === "range" && filter.slug === "sizes" && (
                  <div className={styles.filter__sizes}>
                    {[
                      { key: "width", label: "Ширина (см)", min: filter.min_width || 0, max: filter.max_width || 100 },
                      { key: "height", label: "Высота (см)", min: filter.min_height || 0, max: filter.max_height || 100 },
                      { key: "depth", label: "Глубина (см)", min: filter.min_depth || 0, max: filter.max_depth || 100 },
                    ].map(({ key, label, min, max }) => (
                      <div key={key} className={styles.size__group}>
                        <label className={styles.size__label}>{label}</label>
                        <RangeSlider
                          min={min}
                          max={max}
                          unit="см"
                          value={[
                            tempFilters[filter.slug]?.[key]?.min ?? min,
                            tempFilters[filter.slug]?.[key]?.max ?? max,
                          ]}
                          onChange={([minVal, maxVal]) => {
                            setTempFilters((prev) => ({
                              ...prev,
                              [filter.slug]: {
                                ...prev[filter.slug],
                                [key]: { min: minVal, max: maxVal },
                              },
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {filter.type === "range" && filter.slug === "price" && (
                  <div className={styles.filter__range}>
                    <RangeSlider
                      min={filter.min || 0}
                      max={filter.max || 100000}
                      unit="₽"
                      value={[
                        tempFilters[filter.slug]?.min ?? filter.min ?? 0,
                        tempFilters[filter.slug]?.max ?? filter.max ?? 100000,
                      ]}
                      onChange={([minVal, maxVal]) => {
                        setTempFilters((prev) => ({
                          ...prev,
                          [filter.slug]: { min: minVal, max: maxVal },
                        }));
                      }}
                    />
                  </div>
                )}

                {filter.type === "select" && filter.slug === "colors" && (
                  <div className={styles.filter__colors}>
                    {filter.options?.map((color, colorIndex) => (
                      <button
                        key={colorIndex}
                        className={`${styles.colorOption} ${
                          tempFilters[filter.slug]?.includes(color.id)
                            ? styles.colorOptionActive
                            : ""
                        }`}
                        style={{ backgroundColor: `#${color.code_hex}` }}
                        onClick={() => {
                          const currentValues = tempFilters[filter.slug] || [];
                          const newValues = currentValues.includes(color.id)
                            ? currentValues.filter((val) => val !== color.id)
                            : [...currentValues, color.id];
                          setTempFilters((prev) => ({
                            ...prev,
                            [filter.slug]: newValues,
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
          <div className={styles.noFilters}>Нет доступных фильтров</div>
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
