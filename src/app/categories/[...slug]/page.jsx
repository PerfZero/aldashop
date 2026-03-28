"use client";

import {
  useState,
  useEffect,
  useCallback,
  Suspense,
  useRef,
  useMemo,
} from "react";
import { useParams } from "next/navigation";
import {
  useQueryParam,
  NumberParam,
  StringParam,
  withDefault,
} from "use-query-params";
import Link from "next/link";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Breadcrumbs from "@/components/Breadcrumbs";
import Filters from "@/components/Filters";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ProductSkeleton";
import SortSelect from "@/components/SortSelect";
import { useProducts } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useFilters } from "@/hooks/useFilters";
import styles from "./page.module.css";

const SIZE_LABELS = { width: "Ширина", height: "Высота", depth: "Глубина" };

function buildSelectedFilterChips(appliedFilters, filters) {
  const chips = [];

  for (const [key, value] of Object.entries(appliedFilters)) {
    if (key === "in_stock" || value === undefined || value === null) continue;

    if (key === "price" && typeof value === "object") {
      const parts = [];
      if (value.min != null) {
        parts.push(`от ${value.min.toLocaleString("ru-RU")} ₽`);
      }
      if (value.max != null) {
        parts.push(`до ${value.max.toLocaleString("ru-RU")} ₽`);
      }
      if (parts.length) {
        chips.push({
          key: "price",
          valueId: "price",
          label: "Цена",
          text: parts.join(" "),
        });
      }
      continue;
    }

    if (key === "sizes" && typeof value === "object") {
      for (const [dim, range] of Object.entries(value)) {
        const parts = [];
        if (range?.min != null) parts.push(`от ${range.min}`);
        if (range?.max != null) parts.push(`до ${range.max}`);
        if (parts.length) {
          chips.push({
            key: `sizes.${dim}`,
            valueId: dim,
            label: SIZE_LABELS[dim] || dim,
            text: parts.join(" "),
          });
        }
      }
      continue;
    }

    if (key === "bestseller" && value === true) {
      chips.push({
        key: "bestseller",
        valueId: "bestseller",
        label: "Хит коллекции",
        text: null,
      });
      continue;
    }

    if (Array.isArray(value) && value.length > 0) {
      const filterGroup = filters.find((filterItem) => filterItem.slug === key);
      const label = filterGroup?.title || key;

      value.forEach((id) => {
        chips.push({
          key,
          valueId: id,
          label,
          text:
            filterGroup?.options?.find((option) => option.id === id)?.title ||
            String(id),
        });
      });
    }
  }

  return chips;
}

function removeSelectedFilter(appliedFilters, groupKey, valueId) {
  const updated = { ...appliedFilters };

  if (groupKey === "price") {
    delete updated.price;
  } else if (groupKey === "bestseller") {
    delete updated.bestseller;
  } else if (groupKey.startsWith("sizes.")) {
    const dim = groupKey.replace("sizes.", "");
    const sizes = { ...updated.sizes };
    delete sizes[dim];
    if (Object.keys(sizes).length === 0) {
      delete updated.sizes;
    } else {
      updated.sizes = sizes;
    }
  } else {
    const nextValues = (updated[groupKey] || []).filter((id) => id !== valueId);
    if (nextValues.length === 0) {
      delete updated[groupKey];
    } else {
      updated[groupKey] = nextValues;
    }
  }

  return updated;
}

function CategoryPageContent() {
  const cx = (...classes) => classes.filter(Boolean).join(" ");
  const params = useParams();
  const slugDep = Array.isArray(params?.slug)
    ? params.slug.join("/")
    : params?.slug || "";
  const [sortBy, setSortBy] = useState(3);
  const [showFilters, setShowFilters] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    setShowFilters(!isMobile);
  }, []);
  const [error, setError] = useState(null);
  const [appliedFilters, setAppliedFilters] = useState({ in_stock: true });
  const [categoryId, setCategoryId] = useState(null);
  const [subcategoryId, setSubcategoryId] = useState(null);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [currentSubcategory, setCurrentSubcategory] = useState(null);

  const [sort, setSort] = useQueryParam("sort", NumberParam);

  const [dynamicFilters, setDynamicFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const scrollRestoredRef = useRef(false);
  const productsSectionRef = useRef(null);
  const previousPageRef = useRef(1);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient) {
      sessionStorage.setItem("showFilters", showFilters.toString());
    }
  }, [showFilters, isClient]);

  // Загружаем категории и фильтры через TanStack Query
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();

  useEffect(() => {
    console.log("[categories/[...slug]] Изменение параметров для фильтров:", {
      categoryId,
      subcategoryId,
      dynamicFilters,
    });
  }, [categoryId, subcategoryId, dynamicFilters]);

  const stablePayload = useMemo(
    () => ({ ...dynamicFilters, ...appliedFilters }),
    [dynamicFilters, appliedFilters],
  );

  const { data: filters = [], isLoading: filtersLoading } = useFilters(
    categoryId,
    subcategoryId,
    stablePayload,
  );

  const {
    data,
    isLoading: isProductsLoading,
    isError: isProductsError,
    error: productsError,
  } = useProducts(
    stablePayload,
    categoryId,
    subcategoryId,
    sortBy,
    currentPage,
  );

  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;

  const loading = categoriesLoading || filtersLoading || isProductsLoading;

  const paginationPages = useMemo(() => {
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  useEffect(() => {
    const savedPosition = sessionStorage.getItem("catalogScrollPosition");
    if (
      savedPosition &&
      !isProductsLoading &&
      products.length > 0 &&
      !scrollRestoredRef.current
    ) {
      const scrollPosition = parseInt(savedPosition, 10);
      scrollRestoredRef.current = true;

      const restoreScroll = () => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.scrollTo({
              top: scrollPosition,
              behavior: "instant",
            });
            sessionStorage.removeItem("catalogScrollPosition");
          });
        });
      };

      setTimeout(restoreScroll, 200);
    }
  }, [isProductsLoading, products.length]);

  useEffect(() => {
    if (sort !== undefined && sort !== null) {
      setSortBy(sort);
    }
  }, [sort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, categoryId, subcategoryId, sortBy]);

  useEffect(() => {
    if (previousPageRef.current !== currentPage) {
      previousPageRef.current = currentPage;
      const top =
        (productsSectionRef.current?.getBoundingClientRect().top || 0) +
        window.scrollY -
        110;

      window.scrollTo({
        top: Math.max(0, top),
        behavior: "smooth",
      });
    }
  }, [currentPage]);

  const handleSortChange = (value) => {
    setSortBy(value);
    setSort(value);
  };

  const updateUrlWithDynamicFilters = (filters, isReset = false) => {
    try {
      if (typeof window === "undefined") return;

      const url = new URL(window.location.href);

      // Удаляем все динамические параметры
      const keysToDelete = [];
      for (const key of url.searchParams.keys()) {
        if (
          ![
            "price_min",
            "price_max",
            "in_stock",
            "sort",
            "material",
            "colors",
            "bestseller",
            "category_id",
            "subcategory_id",
            "flag_type",
          ].includes(key)
        ) {
          keysToDelete.push(key);
        }
      }

      keysToDelete.forEach((key) => {
        url.searchParams.delete(key);
      });

      // Если это не сброс, добавляем новые динамические фильтры
      if (!isReset) {
        Object.keys(filters).forEach((key) => {
          const value = filters[key];
          if (Array.isArray(value) && value.length > 0) {
            url.searchParams.set(key, value.join(","));
          } else if (value !== undefined && value !== null && value !== "") {
            url.searchParams.set(key, value.toString());
          }
        });
      }

      window.history.replaceState({}, "", url.toString());
    } catch (error) {
      console.error("Error in updateUrlWithDynamicFilters:", error);
    }
  };

  const parseDynamicFiltersFromUrl = () => {
    try {
      if (typeof window === "undefined") return {};

      const url = new URL(window.location.href);
      const dynamicFilters = {};

      for (const [key, value] of url.searchParams.entries()) {
        if (
          ![
            "price_min",
            "price_max",
            "in_stock",
            "sort",
            "material",
            "colors",
            "bestseller",
            "category_id",
            "subcategory_id",
            "width_min",
            "width_max",
            "height_min",
            "height_max",
            "depth_min",
            "depth_max",
          ].includes(key)
        ) {
          if (value && value.includes(",")) {
            dynamicFilters[key] = value.split(",").map((v) => {
              const num = parseInt(v);
              return isNaN(num) ? v : num;
            });
          } else if (value) {
            const num = parseInt(value);
            dynamicFilters[key] = isNaN(num) ? value : [num];
          }
        }
      }

      return dynamicFilters;
    } catch (error) {
      console.error("Ошибка при парсинге URL параметров:", error);
      return {};
    }
  };

  const parseAllFiltersFromUrl = () => {
    try {
      if (typeof window === "undefined") return {};

      const url = new URL(window.location.href);
      const filters = {};

      if (url.searchParams.get("in_stock") === "true") {
        filters.in_stock = true;
      }

      if (url.searchParams.get("bestseller") === "true") {
        filters.bestseller = true;
      }

      const priceMin = url.searchParams.get("price_min");
      const priceMax = url.searchParams.get("price_max");
      if (priceMin || priceMax) {
        filters.price = {};
        if (priceMin) filters.price.min = parseInt(priceMin);
        if (priceMax) filters.price.max = parseInt(priceMax);
      }

      const colors = url.searchParams.get("colors");
      if (colors) {
        filters.colors = colors
          .split(",")
          .map((c) => parseInt(c))
          .filter((c) => !isNaN(c));
      }

      const material = url.searchParams.get("material");
      if (material) {
        filters.material = material
          .split(",")
          .map((m) => parseInt(m))
          .filter((m) => !isNaN(m));
      }

      const widthMin = url.searchParams.get("width_min");
      const widthMax = url.searchParams.get("width_max");
      const heightMin = url.searchParams.get("height_min");
      const heightMax = url.searchParams.get("height_max");
      const depthMin = url.searchParams.get("depth_min");
      const depthMax = url.searchParams.get("depth_max");

      if (
        widthMin ||
        widthMax ||
        heightMin ||
        heightMax ||
        depthMin ||
        depthMax
      ) {
        filters.sizes = {};
        if (widthMin || widthMax) {
          filters.sizes.width = {};
          if (widthMin) filters.sizes.width.min = parseInt(widthMin);
          if (widthMax) filters.sizes.width.max = parseInt(widthMax);
        }
        if (heightMin || heightMax) {
          filters.sizes.height = {};
          if (heightMin) filters.sizes.height.min = parseInt(heightMin);
          if (heightMax) filters.sizes.height.max = parseInt(heightMax);
        }
        if (depthMin || depthMax) {
          filters.sizes.depth = {};
          if (depthMin) filters.sizes.depth.min = parseInt(depthMin);
          if (depthMax) filters.sizes.depth.max = parseInt(depthMax);
        }
      }

      for (const [key, value] of url.searchParams.entries()) {
        if (
          ![
            "price_min",
            "price_max",
            "in_stock",
            "sort",
            "material",
            "colors",
            "bestseller",
            "category_id",
            "subcategory_id",
            "width_min",
            "width_max",
            "height_min",
            "height_max",
            "depth_min",
            "depth_max",
          ].includes(key)
        ) {
          if (value && value.includes(",")) {
            filters[key] = value.split(",").map((v) => {
              const num = parseInt(v);
              return isNaN(num) ? v : num;
            });
          } else if (value) {
            const num = parseInt(value);
            filters[key] = isNaN(num) ? [value] : [num];
          }
        }
      }

      return filters;
    } catch (error) {
      console.error("Ошибка при парсинге всех фильтров из URL:", error);
      return {};
    }
  };

  const handleFiltersApply = (newFilters) => {
    setAppliedFilters(newFilters);
    // Сбрасываем dynamicFilters, чтобы он не перекрывал appliedFilters в stablePayload
    setDynamicFilters({});

    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    // Удаляем все параметры кроме навигационных
    const navKeys = new Set(["flag_type"]);
    for (const key of Array.from(url.searchParams.keys())) {
      if (!navKeys.has(key)) url.searchParams.delete(key);
    }
    // Записываем все фильтры из newFilters
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === "price") {
        if (value?.min != null)
          url.searchParams.set("price_min", String(value.min));
        if (value?.max != null)
          url.searchParams.set("price_max", String(value.max));
      } else if (key === "sizes") {
        ["width", "height", "depth"].forEach((dim) => {
          if (value?.[dim]?.min != null)
            url.searchParams.set(`${dim}_min`, String(value[dim].min));
          if (value?.[dim]?.max != null)
            url.searchParams.set(`${dim}_max`, String(value[dim].max));
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
  };

  useEffect(() => {
    scrollRestoredRef.current = false;
  }, [slugDep]);

  useEffect(() => {
    if (!categories.length) return;

    const sortedData = categories
      .sort((a, b) => {
        const aDisplayId = a.display_id || 999;
        const bDisplayId = b.display_id || 999;
        return aDisplayId - bDisplayId;
      })
      .map((category) => ({
        ...category,
        subcategories:
          category.subcategories?.sort((a, b) => {
            const aDisplayId = a.display_id || 999;
            const bDisplayId = b.display_id || 999;
            return aDisplayId - bDisplayId;
          }) || [],
      }));

    const slugArr = Array.isArray(params?.slug)
      ? params.slug
      : params?.slug
        ? [params.slug]
        : [];
    if (!slugArr || slugArr.length === 0) return;

    if (slugArr.length >= 2) {
      const [catSlug, subSlug] = slugArr;
      const cat = sortedData.find((c) => c.slug === catSlug);
      if (cat) {
        const sub = (cat.subcategories || []).find(
          (s) => s.slug === subSlug && subSlug !== "all",
        );
        console.log("[categories/[...slug]] Смена категории (подкатегория):", {
          categoryId: cat.id,
          subcategoryId: sub?.id,
          slug: catSlug,
          subSlug,
        });
        setCategoryId(cat.id);
        setSubcategoryId(sub ? sub.id : null);
        setCurrentCategory({
          id: cat.id,
          slug: cat.slug,
          title: cat.title,
          description: cat.description,
          photo_cover: cat.photo_cover,
        });
        setCurrentSubcategory(
          sub
            ? {
                id: sub.id,
                slug: sub.slug,
                title: sub.title,
                description: sub.description,
                photo_cover: sub.photo_cover,
              }
            : null,
        );
        return;
      }
    }

    const currentSlug = slugArr[0];

    const cat = sortedData.find((c) => c.slug === currentSlug);
    if (cat) {
      console.log("[categories/[...slug]] Смена категории:", {
        categoryId: cat.id,
        subcategoryId: null,
        slug: currentSlug,
      });
      setCategoryId(cat.id);
      setSubcategoryId(null);
      setCurrentCategory({
        id: cat.id,
        slug: cat.slug,
        title: cat.title,
        description: cat.description,
        photo_cover: cat.photo_cover,
      });
      setCurrentSubcategory(null);
      return;
    } else {
    }

    for (const c of sortedData) {
      const sub = (c.subcategories || []).find((s) => s.slug === currentSlug);
      if (sub) {
        console.log(
          "[categories/[...slug]] Смена категории (подкатегория найдена):",
          { categoryId: c.id, subcategoryId: sub.id, slug: currentSlug },
        );
        setCategoryId(c.id);
        setSubcategoryId(sub.id);
        setCurrentCategory({
          id: c.id,
          slug: c.slug,
          title: c.title,
          description: c.description,
          photo_cover: c.photo_cover,
        });
        setCurrentSubcategory({
          id: sub.id,
          slug: sub.slug,
          title: sub.title,
          description: sub.description,
          photo_cover: sub.photo_cover,
        });
        return;
      }
    }
  }, [categories, slugDep]);

  useEffect(() => {
    const urlDynamicFilters = parseDynamicFiltersFromUrl();
    setDynamicFilters(urlDynamicFilters);

    const urlFilters = parseAllFiltersFromUrl();
    if (Object.keys(urlFilters).length > 0) {
      setAppliedFilters(urlFilters);
    }
  }, []);

  useEffect(() => {
    const handleUrlChange = () => {
      const urlDynamicFilters = parseDynamicFiltersFromUrl();
      setDynamicFilters(urlDynamicFilters);

      const urlFilters = parseAllFiltersFromUrl();
      setAppliedFilters(urlFilters);
    };

    window.addEventListener("popstate", handleUrlChange);
    return () => window.removeEventListener("popstate", handleUrlChange);
  }, []);

  useEffect(() => {
    const handlePageShow = (e) => {
      if (typeof window === "undefined") return;
      if (e.persisted) {
        const urlDynamicFilters = parseDynamicFiltersFromUrl();
        setDynamicFilters(urlDynamicFilters);

        const urlFilters = parseAllFiltersFromUrl();
        setAppliedFilters(urlFilters);
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  const breadcrumbs = [
    { text: "Главная", href: "/" },
    ...(currentCategory
      ? [
          {
            text: currentCategory.title,
            href: `/categories/${currentCategory.slug}`,
          },
        ]
      : []),
    ...(currentSubcategory
      ? [
          {
            text: currentSubcategory.title,
            href: `/categories/${currentCategory?.slug}/${currentSubcategory.slug}`,
          },
        ]
      : currentCategory
        ? [
            {
              text: "Все товары",
              href: `/categories/${currentCategory.slug}/all`,
            },
          ]
        : []),
  ];

  const transformProduct = (product) => {
    return product;
  };

  const heroTitle = currentSubcategory?.title || currentCategory?.title;
  const heroDescription =
    currentSubcategory?.description || currentCategory?.description;
  const heroPhoto =
    currentSubcategory?.photo_cover && currentSubcategory.photo_cover !== null
      ? currentSubcategory.photo_cover.startsWith("http")
        ? currentSubcategory.photo_cover
        : `https://aldalinde.ru${currentSubcategory.photo_cover}`
      : currentCategory?.photo_cover && currentCategory.photo_cover !== null
        ? currentCategory.photo_cover.startsWith("http")
          ? currentCategory.photo_cover
          : `https://aldalinde.ru${currentCategory.photo_cover}`
        : null;
  const activeCategoryTitle =
    currentSubcategory?.title || currentCategory?.title;
  const categoryResetHref = currentSubcategory
    ? `/categories/${currentCategory?.slug}/all`
    : "/categories";
  const selectedFilterChips = buildSelectedFilterChips(appliedFilters, filters);
  const showHero = heroTitle || heroDescription || heroPhoto;
  const isLoadingHero =
    categoriesLoading && !currentCategory && !currentSubcategory;

  return (
    <main className={styles.page}>
      <Breadcrumbs items={breadcrumbs} />

      {showHero || isLoadingHero ? (
        <div className={styles.hero}>
          <div
            className={cx(
              styles.hero__content,
              isLoadingHero && styles.skeleton,
              heroPhoto && styles.photo_cover,
            )}
          >
            {isLoadingHero ? (
              <>
                <div className={styles.hero__skeleton_bg} />
                <div
                  className={styles.hero__skeleton_text}
                  style={{
                    height: "32px",
                    width: "300px",
                    marginBottom: "20px",
                    zIndex: 3,
                    position: "relative",
                  }}
                />
                <div
                  className={styles.hero__skeleton_text}
                  style={{
                    height: "20px",
                    width: "600px",
                    maxWidth: "824px",
                    zIndex: 3,
                    position: "relative",
                    margin: "0 auto",
                  }}
                />
              </>
            ) : (
              <>
                {heroTitle && (
                  <h1 className={styles.hero__title}>{heroTitle}</h1>
                )}
                {heroDescription && (
                  <p className={styles.hero__description}>{heroDescription}</p>
                )}
                {heroPhoto && (
                  <img
                    className={`${styles.hero__img} ${styles.photo_cover}`}
                    src={heroPhoto}
                    alt={heroTitle || "Категория"}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      ) : null}

      <div className={styles.controls}>
        <div className={styles.controls__group}>
          <button
            className={styles.filters__button}
            onClick={() => {
              const next = !showFilters;
              setShowFilters(next);
              if (typeof window !== "undefined") {
                sessionStorage.setItem("showFilters", next.toString());
              }
            }}
            type="button"
          >
            <img
              className={styles.filters__buttonIcon}
              src="/filter.svg"
              alt=""
              aria-hidden="true"
            />
            <span suppressHydrationWarning>
              {showFilters ? "Спрятать фильтры" : "Показать фильтры"}
            </span>
          </button>

          {activeCategoryTitle && (
            <div className={styles.controls__chip}>
              <span className={styles.controls__chipLabel}>Категория:</span>
              <span className={styles.controls__chipText}>
                {activeCategoryTitle}
              </span>
              <Link
                className={styles.controls__chipAction}
                href={categoryResetHref}
                aria-label="Сбросить категорию"
              >
                <img
                  className={styles.controls__chipIcon}
                  src="/catalog-chip-close.svg"
                  alt=""
                  aria-hidden="true"
                />
              </Link>
            </div>
          )}

          {selectedFilterChips.map((chip) => (
            <button
              key={`${chip.key}-${chip.valueId}`}
              className={styles.controls__chip}
              onClick={() =>
                handleFiltersApply(
                  removeSelectedFilter(appliedFilters, chip.key, chip.valueId),
                )
              }
              type="button"
              aria-label={`Удалить фильтр ${chip.label}`}
            >
              <span className={styles.controls__chipLabel}>{chip.label}:</span>
              {chip.text && (
                <span className={styles.controls__chipText}>{chip.text}</span>
              )}
              <img
                className={styles.controls__chipIcon}
                src="/catalog-chip-close.svg"
                alt=""
                aria-hidden="true"
              />
            </button>
          ))}

          <Link className={styles.controls__reset} href={categoryResetHref}>
            <span className={styles.controls__resetIcon} aria-hidden="true">
              <svg
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.422 4.48928C14.4493 2.81049 12.8996 1.54242 11.0615 0.921173C9.22343 0.29993 7.22221 0.367858 5.43047 1.11231C3.63874 1.85676 2.17862 3.22699 1.32197 4.96787C0.465329 6.70876 0.27055 8.70163 0.773905 10.5754C1.27726 12.4492 2.44444 14.0763 4.05812 15.1535C5.6718 16.2308 7.622 16.685 9.54559 16.4314C11.4692 16.1778 13.2351 15.2338 14.5144 13.7751C15.7938 12.3164 16.4994 10.4425 16.5 8.50228"
                  stroke="#D25C1B"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11.5 4.50232H15.5V0.502319"
                  stroke="#D25C1B"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>Сбросить всё</span>
          </Link>
        </div>

        <div className={styles.controls__sort}>
          <SortSelect
            value={sortBy}
            onChange={handleSortChange}
            variant="catalog"
            options={
              filters
                .find((f) => f.slug === "sort")
                ?.options?.map((option) => ({
                  value: option.id,
                  label: option.title,
                })) || [
                { value: 1, label: "Популярные" },
                { value: 2, label: "Высокий рейтинг" },
                { value: 3, label: "По возрастанию цены" },
                { value: 4, label: "По убыванию цены" },
              ]
            }
          />
        </div>
      </div>

      <div className={styles.content} ref={productsSectionRef}>
        <Filters
          isVisible={showFilters}
          onClose={() => {
            setShowFilters(false);
            if (typeof window !== "undefined") {
              sessionStorage.setItem("showFilters", "false");
            }
          }}
          filters={filters}
          loading={
            categoriesLoading || (filtersLoading && filters.length === 0)
          }
          error={error}
          onApply={handleFiltersApply}
          appliedFilters={appliedFilters}
          categories={categories}
        />
        <div className={styles.productsArea}>
          <div
            className={cx(styles.products, showFilters && styles.filtersOpen)}
          >
            {isProductsLoading && products.length === 0 ? (
              <ProductSkeleton count={8} />
            ) : isProductsError ? (
              <div className={styles.noProducts}>
                Ошибка загрузки товаров: {productsError?.message}
              </div>
            ) : products.length > 0 ? (
              <>
                {products.map((product, index) => (
                  <ProductCard
                    key={`${product.id}-${index}`}
                    product={transformProduct(product)}
                    filtersOpen={showFilters}
                  />
                ))}
              </>
            ) : (
              <div className={styles.noProducts}>Товары не найдены</div>
            )}
          </div>
          {products.length > 0 && totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={`${styles.pagination__button} ${styles.pagination__button_nav}`}
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                type="button"
                aria-label="Предыдущая страница"
              >
                <svg
                  className={styles.pagination__icon}
                  width="14"
                  height="8"
                  viewBox="0 0 14 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0.146446 4.03568C-0.0488157 3.84042 -0.0488157 3.52384 0.146446 3.32858L3.32843 0.146595C3.52369 -0.0486672 3.84027 -0.0486672 4.03553 0.146595C4.2308 0.341857 4.2308 0.65844 4.03553 0.853702L1.20711 3.68213L4.03553 6.51056C4.2308 6.70582 4.2308 7.0224 4.03553 7.21766C3.84027 7.41293 3.52369 7.41293 3.32843 7.21766L0.146446 4.03568ZM13.5 3.68213V4.18213H0.5V3.68213V3.18213H13.5V3.68213Z"
                    fill="currentColor"
                  />
                </svg>
              </button>

              {paginationPages.map((page) => (
                <button
                  key={page}
                  className={cx(
                    styles.pagination__button,
                    styles.pagination__button_page,
                    page === currentPage && styles.pagination__button_active,
                  )}
                  onClick={() => setCurrentPage(page)}
                  type="button"
                >
                  <span className={styles.pagination__label}>{page}</span>
                </button>
              ))}
              <button
                className={`${styles.pagination__button} ${styles.pagination__button_nav}`}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                type="button"
                aria-label="Следующая страница"
              >
                <svg
                  className={styles.pagination__icon}
                  width="14"
                  height="8"
                  viewBox="0 0 14 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M13.3536 4.03568C13.5488 3.84042 13.5488 3.52384 13.3536 3.32858L10.1716 0.146595C9.97631 -0.0486672 9.65973 -0.0486672 9.46447 0.146595C9.2692 0.341857 9.2692 0.65844 9.46447 0.853702L12.2929 3.68213L9.46447 6.51056C9.2692 6.70582 9.2692 7.0224 9.46447 7.21766C9.65973 7.41293 9.97631 7.41293 10.1716 7.21766L13.3536 4.03568ZM0 3.68213V4.18213H13V3.68213V3.18213H0V3.68213Z"
                    fill="currentColor"
                  />
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
