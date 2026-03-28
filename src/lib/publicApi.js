const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

const isLocalRuntime = () =>
  typeof window !== "undefined" && LOCAL_HOSTS.has(window.location.hostname);

export const getCategoriesApiUrl = () =>
  isLocalRuntime()
    ? "/api/categories"
    : "https://aldalinde.ru/api/products/category-list/";

export const getFooterInfoApiUrl = () =>
  isLocalRuntime()
    ? "/api/footer-info"
    : "https://aldalinde.ru/api/footer-info/";

export const getPromoBannerApiUrl = () =>
  isLocalRuntime()
    ? "/api/products/banner"
    : "https://aldalinde.ru/api/products/get_banner";

export const getReviewsApiUrl = ({
  productId,
  sortBy,
  limit,
  page,
}) =>
  isLocalRuntime()
    ? `/api/products/reviews?product_id=${encodeURIComponent(productId)}&sort_by=${encodeURIComponent(sortBy)}&limit=${encodeURIComponent(limit)}&page=${encodeURIComponent(page)}`
    : `https://aldalinde.ru/api/products/reviews/${encodeURIComponent(productId)}/?sort_by=${encodeURIComponent(sortBy)}&limit=${encodeURIComponent(limit)}&page=${encodeURIComponent(page)}`;
