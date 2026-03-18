"use client";

import { useState, useEffect, useCallback, Suspense, useRef, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import Filters from "@/components/Filters";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import SortSelect from "@/components/SortSelect";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useFilters } from "@/hooks/useFilters";
import { useNoCategoryInfo } from "@/hooks/useNoCategoryInfo";
import styles from "./[...slug]/page.module.css";

const cx = (...classes) => classes.filter(Boolean).join(" ");

function parseFiltersFromSearchParams(searchParams) {
  const filters = {};
  if (searchParams.get("in_stock") === "true") filters.in_stock = true;
  if (searchParams.get("bestseller") === "true") filters.bestseller = true;
  const priceMin = searchParams.get("price_min");
  const priceMax = searchParams.get("price_max");
  if (priceMin || priceMax) {
    filters.price = {};
    if (priceMin) filters.price.min = parseInt(priceMin);
    if (priceMax) filters.price.max = parseInt(priceMax);
  }
  const colors = searchParams.get("colors");
  if (colors) filters.colors = colors.split(",").map(Number).filter(Boolean);
  const material = searchParams.get("material");
  if (material) filters.material = material.split(",").map(Number).filter(Boolean);
  return filters;
}

function getPhotoUrl(photo) {
  if (!photo) return null;
  return photo.startsWith("http") ? photo : `https://aldalinde.ru${photo}`;
}

function CategoryPageContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // --- Всё из URL, без state ---
  const categoryId = useMemo(() => {
    const id = searchParams.get("category_id");
    return id ? parseInt(id, 10) : null;
  }, [searchParams]);

  const subcategoryId = useMemo(() => {
    const id = searchParams.get("subcategory_id");
    return id ? parseInt(id, 10) : null;
  }, [searchParams]);

  const flagType = searchParams.get("flag_type") || null;

  const dynamicFilters = useMemo(() => {
    const excluded = new Set([
      "price_min", "price_max", "in_stock", "sort", "material", "colors",
      "bestseller", "category_id", "subcategory_id",
      "width_min", "width_max", "height_min", "height_max", "depth_min", "depth_max",
    ]);
    const result = {};
    for (const [key, value] of searchParams.entries()) {
      if (excluded.has(key)) continue;
      if (key === "flag_type") {
        result[key] = value;
      } else if (value.includes(",")) {
        result[key] = value.split(",").map(v => { const n = parseInt(v); return isNaN(n) ? v : n; });
      } else {
        const n = parseInt(value);
        result[key] = isNaN(n) ? [value] : [n];
      }
    }
    return result;
  }, [searchParams]);

  // --- Категории ---
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const currentCategory = useMemo(() => {
    if (!categoryId || !categories.length) return null;
    return categories.find(c => c.id === categoryId) || null;
  }, [categoryId, categories]);

  const currentSubcategory = useMemo(() => {
    if (!subcategoryId || !currentCategory) return null;
    return currentCategory.subcategories?.find(s => s.id === subcategoryId) || null;
  }, [subcategoryId, currentCategory]);

  // --- No-category info (только для /categories без category_id) ---
  const shouldFetchNoCategoryInfo = !categoryId && pathname === "/categories";
  const { data: noCategoryInfo, isLoading: noCategoryInfoLoading } = useNoCategoryInfo(shouldFetchNoCategoryInfo);

  // --- UI state ---
  const [sortBy, setSortBy] = useState(() => {
    const sort = searchParams.get("sort");
    return sort ? parseInt(sort, 10) : 1;
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [appliedFilters, setAppliedFilters] = useState({ in_stock: true });

  // Инициализация фильтров из URL при монтировании
  useEffect(() => {
    const urlFilters = parseFiltersFromSearchParams(searchParams);
    if (Object.keys(urlFilters).length > 0) {
      setAppliedFilters(urlFilters);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setIsClient(true); }, []);
  useEffect(() => {
    setShowFilters(window.innerWidth >= 768);
  }, []);

  // Сброс состояния при смене категории/флага
  const scopeKey = `${categoryId ?? ""}|${subcategoryId ?? ""}|${flagType ?? ""}`;
  const prevScopeRef = useRef(null);
  useEffect(() => {
    if (prevScopeRef.current !== null && prevScopeRef.current !== scopeKey) {
      setCurrentPage(1);
      setSortBy(1);
      setAppliedFilters({ in_stock: true });
    }
    prevScopeRef.current = scopeKey;
  }, [scopeKey]);

  // Сброс страницы при смене фильтров или сортировки
  const prevFiltersKeyRef = useRef(null);
  useEffect(() => {
    const key = JSON.stringify(appliedFilters) + String(sortBy);
    if (prevFiltersKeyRef.current !== null && prevFiltersKeyRef.current !== key) {
      setCurrentPage(1);
    }
    prevFiltersKeyRef.current = key;
  }, [appliedFilters, sortBy]);

  // --- Фильтры и товары ---
  const stablePayload = useMemo(
    () => ({ ...dynamicFilters, ...appliedFilters }),
    [appliedFilters, dynamicFilters],
  );

  // useFilters всегда использует стабильный payload (без preview) — иначе бесконечный цикл
  const { data: filters = [], isLoading: filtersLoading } = useFilters(
    categoryId, subcategoryId, stablePayload,
  );

  const { data, isLoading: isProductsLoading, isError: isProductsError, error: productsError } = useProducts(
    stablePayload, categoryId, subcategoryId, sortBy, currentPage,
  );

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;

  // --- Скролл ---
  const scrollRestoredRef = useRef(false);
  const productsSectionRef = useRef(null);
  const previousPageRef = useRef(1);

  useEffect(() => { scrollRestoredRef.current = false; }, [scopeKey]);

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("catalogScrollPosition");
    if (savedPosition && !isProductsLoading && products.length > 0 && !scrollRestoredRef.current) {
      scrollRestoredRef.current = true;
      const pos = parseInt(savedPosition, 10);
      setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({ top: pos, behavior: "instant" });
            sessionStorage.removeItem("catalogScrollPosition");
          });
        });
      }, 200);
    }
  }, [isProductsLoading, products.length]);

  useEffect(() => {
    if (previousPageRef.current !== currentPage) {
      previousPageRef.current = currentPage;
      const top = (productsSectionRef.current?.getBoundingClientRect().top || 0) + window.scrollY - 110;
      window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    }
  }, [currentPage]);

  // --- Применение фильтров ---
  const handleFiltersApply = useCallback((newFilters) => {
    setAppliedFilters(newFilters);

    const url = new URL(window.location.href);
    // Удаляем все параметры кроме навигационных
    const navKeys = new Set(["category_id", "subcategory_id", "flag_type"]);
    for (const key of Array.from(url.searchParams.keys())) {
      if (!navKeys.has(key)) url.searchParams.delete(key);
    }
    // Записываем все фильтры из newFilters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === "price") {
        if (value?.min != null) url.searchParams.set("price_min", String(value.min));
        if (value?.max != null) url.searchParams.set("price_max", String(value.max));
      } else if (key === "sizes") {
        ["width", "height", "depth"].forEach((dim) => {
          if (value?.[dim]?.min != null) url.searchParams.set(`${dim}_min`, String(value[dim].min));
          if (value?.[dim]?.max != null) url.searchParams.set(`${dim}_max`, String(value[dim].max));
        });
      } else if (Array.isArray(value) && value.length > 0) {
        url.searchParams.set(key, value.join(","));
      } else if (value === true) {
        url.searchParams.set(key, "true");
      } else if (typeof value === "number" && !isNaN(value)) {
        url.searchParams.set(key, String(value));
      }
    });

    window.history.replaceState({}, "", url.toString());
  }, []);

  // --- Пагинация ---
  const paginationPages = useMemo(() => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  // --- Хлебные крошки ---
  const breadcrumbs = [
    { text: "Главная", href: "/" },
    ...(currentCategory ? [{ text: currentCategory.title, href: `/categories/${currentCategory.slug}` }] : []),
    ...(currentSubcategory
      ? [{ text: currentSubcategory.title, href: `/categories/${currentCategory?.slug}/${currentSubcategory.slug}` }]
      : currentCategory
        ? [{ text: "Все товары", href: `/categories/${currentCategory.slug}/all` }]
        : []),
  ];

  // --- Hero ---
  const heroTitle = currentSubcategory?.title || currentCategory?.title || noCategoryInfo?.title;
  const heroDescription = currentSubcategory?.description || currentCategory?.description || noCategoryInfo?.description;
  const heroPhoto =
    getPhotoUrl(currentSubcategory?.photo_cover) ||
    getPhotoUrl(currentCategory?.photo_cover) ||
    getPhotoUrl(noCategoryInfo?.photo_cover);
  const showHero = heroTitle || heroDescription || heroPhoto;
  const isLoadingHero =
    (categoryId && categoriesLoading && !currentCategory) ||
    (!categoryId && noCategoryInfoLoading && shouldFetchNoCategoryInfo);

  return (
    <main className={styles.page}>
      <Breadcrumbs items={breadcrumbs} />

      {(showHero || isLoadingHero) && (
        <div className={styles.hero}>
          <div className={cx(styles.hero__content, isLoadingHero && styles.skeleton, heroPhoto && styles.photo_cover)}>
            {isLoadingHero ? (
              <>
                <div className={styles.hero__skeleton_bg} />
                <div className={styles.hero__skeleton_text} style={{ height: "32px", width: "300px", marginBottom: "20px", zIndex: 3, position: "relative" }} />
                <div className={styles.hero__skeleton_text} style={{ height: "20px", width: "600px", maxWidth: "824px", zIndex: 3, position: "relative", margin: "0 auto" }} />
              </>
            ) : (
              <>
                {heroTitle && <h1 className={styles.hero__title}>{heroTitle}</h1>}
                {heroDescription && <p className={styles.hero__description}>{heroDescription}</p>}
                {heroPhoto && (
                  <img
                    className={`${styles.hero__img} ${styles.photo_cover}`}
                    src={heroPhoto}
                    alt={heroTitle || "Категория"}
                    onError={(e) => { e.target.style.display = "none"; }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}

      <div className={styles.controls}>
        <button
          className={styles.filters__button}
          onClick={() => {
            const next = !showFilters;
            setShowFilters(next);
            sessionStorage.setItem("showFilters", next.toString());
          }}
        >
          <span suppressHydrationWarning>{showFilters ? "Скрыть фильтры" : "Показать фильтры"}</span>
        </button>
        <SortSelect
          value={sortBy}
          onChange={setSortBy}
          options={
            filters.find(f => f.slug === "sort")?.options?.map(o => ({ value: o.id, label: o.title })) || [
              { value: 1, label: "Популярные" },
              { value: 2, label: "Высокий рейтинг" },
              { value: 3, label: "По возрастанию цены" },
              { value: 4, label: "По убыванию цены" },
            ]
          }
        />
      </div>

      <div className={styles.content} ref={productsSectionRef}>
        <Filters
          isVisible={isClient ? showFilters : false}
          onClose={() => {
            setShowFilters(false);
            sessionStorage.setItem("showFilters", "false");
          }}
          filters={filters}
          loading={categoriesLoading || (filtersLoading && filters.length === 0)}
          error={null}
          onApply={handleFiltersApply}
          appliedFilters={appliedFilters}
          categories={categories}
        />
        <div className={styles.productsArea}>
          <div className={cx(styles.products, showFilters && styles.filtersOpen)}>
            {isProductsLoading && products.length === 0 ? (
              <ProductSkeleton count={8} />
            ) : isProductsError ? (
              <div className={styles.noProducts}>Ошибка загрузки товаров: {productsError?.message}</div>
            ) : products.length > 0 ? (
              products.map((product, index) => (
                <ProductCard key={`${product.id}-${index}`} product={product} filtersOpen={showFilters} />
              ))
            ) : (
              <div className={styles.noProducts}>Товары не найдены</div>
            )}
          </div>

          {products.length > 0 && totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={`${styles.pagination__button} ${styles.pagination__button_nav}`}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                type="button"
                aria-label="Предыдущая страница"
              >
                <svg className={styles.pagination__icon} width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M0.146446 4.03568C-0.0488157 3.84042 -0.0488157 3.52384 0.146446 3.32858L3.32843 0.146595C3.52369 -0.0486672 3.84027 -0.0486672 4.03553 0.146595C4.2308 0.341857 4.2308 0.65844 4.03553 0.853702L1.20711 3.68213L4.03553 6.51056C4.2308 6.70582 4.2308 7.0224 4.03553 7.21766C3.84027 7.41293 3.52369 7.41293 3.32843 7.21766L0.146446 4.03568ZM13.5 3.68213V4.18213H0.5V3.68213V3.18213H13.5V3.68213Z" fill="currentColor"/>
                </svg>
              </button>
              {paginationPages.map(page => (
                <button
                  key={page}
                  className={cx(styles.pagination__button, styles.pagination__button_page, page === currentPage && styles.pagination__button_active)}
                  onClick={() => setCurrentPage(page)}
                  type="button"
                >
                  <span className={styles.pagination__label}>{page}</span>
                </button>
              ))}
              <button
                className={`${styles.pagination__button} ${styles.pagination__button_nav}`}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                type="button"
                aria-label="Следующая страница"
              >
                <svg className={styles.pagination__icon} width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.3536 4.03568C13.5488 3.84042 13.5488 3.52384 13.3536 3.32858L10.1716 0.146595C9.97631 -0.0486672 9.65973 -0.0486672 9.46447 0.146595C9.2692 0.341857 9.2692 0.65844 9.46447 0.853702L12.2929 3.68213L9.46447 6.51056C9.2692 6.70582 9.2692 7.0224 9.46447 7.21766C9.65973 7.41293 9.97631 7.41293 10.1716 7.21766L13.3536 4.03568ZM0 3.68213V4.18213H13V3.68213V3.18213H0V3.68213Z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CategoryPageContent />
    </Suspense>
  );
}
