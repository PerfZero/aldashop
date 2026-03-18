import { useQuery } from "@tanstack/react-query";
import { buildCatalogRequestBody } from "@/lib/catalogRequestBody";

const PAGE_SIZE = 24;

const fetchProducts = async ({ queryKey }) => {
  const [, filters, categoryId, subcategoryId, sortBy, page] = queryKey;

  const requestBody = buildCatalogRequestBody({
    filters,
    categoryId,
    subcategoryId,
    sortBy,
    page,
    limit: PAGE_SIZE,
    includePagination: true,
  });

  const response = await fetch("/api/products/models-list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(localStorage.getItem("accessToken") && {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      }),
    },
    credentials: "include",
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || "Failed to fetch products");
  }

  const data = await response.json();
  const totalCount = data.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return {
    products: data.results || [],
    totalCount,
    totalPages,
    currentPage: page,
    pageSize: PAGE_SIZE,
  };
};

export const useProducts = (
  filters,
  categoryId,
  subcategoryId,
  sortBy,
  page,
) => {
  const serializedFilters = JSON.stringify(filters || {});

  return useQuery({
    queryKey: [
      "products",
      filters,
      categoryId,
      subcategoryId,
      sortBy,
      page,
      serializedFilters,
    ],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    placeholderData: (previousData) => previousData,
  });
};
