import { useQuery } from "@tanstack/react-query";

const PAGE_SIZE = 24;

const fetchProducts = async ({ queryKey }) => {
  const [, filters, categoryId, subcategoryId, sortBy, page] = queryKey;

  const requestBody = {
    page,
    limit: PAGE_SIZE,
  };

  if (categoryId) {
    requestBody.category_id = categoryId;
  }

  if (subcategoryId) {
    requestBody.subcategory_id = subcategoryId;
  }

  if (typeof sortBy === "number") {
    requestBody.sort = sortBy;
  }

  if (filters) {
    if (filters.in_stock === true) {
      requestBody.in_stock = true;
    }

    if (Array.isArray(filters.material) && filters.material.length > 0) {
      requestBody.material_search = filters.material.join(" ");
    }

    if (filters.bestseller === true) {
      requestBody.bestseller = true;
    }

    if (Array.isArray(filters.colors) && filters.colors.length > 0) {
      requestBody.colors = filters.colors.map((color) => parseInt(color));
    }

    if (filters.sizes) {
      const sizesData = {};

      if (filters.sizes.width) {
        sizesData.width = {
          min: Number(filters.sizes.width.min) || 0,
          max: Number(filters.sizes.width.max) || 0,
        };
      }

      if (filters.sizes.height) {
        sizesData.height = {
          min: Number(filters.sizes.height.min) || 0,
          max: Number(filters.sizes.height.max) || 0,
        };
      }

      if (filters.sizes.depth) {
        sizesData.depth = {
          min: Number(filters.sizes.depth.min) || 0,
          max: Number(filters.sizes.depth.max) || 0,
        };
      }

      if (Object.keys(sizesData).length > 0) {
        requestBody.sizes = sizesData;
      }
    }

    if (
      filters.price &&
      (filters.price.min !== undefined || filters.price.max !== undefined)
    ) {
      requestBody.price = {};
      if (filters.price.min !== undefined) {
        requestBody.price.min = filters.price.min;
      }
      if (filters.price.max !== undefined) {
        requestBody.price.max = filters.price.max;
      }
    }

    if (filters.search && filters.search.trim() !== "") {
      requestBody.search = filters.search.trim();
    }

    Object.keys(filters).forEach((key) => {
      if (
        ![
          "price",
          "in_stock",
          "sort",
          "material",
          "colors",
          "bestseller",
          "sizes",
          "search",
          "category_id",
          "subcategory_id",
        ].includes(key)
      ) {
        const value = filters[key];
        if (key === "flag_type") {
          requestBody[key] = value;
        } else if (Array.isArray(value) && value.length > 0) {
          requestBody[key] = value;
        } else if (value !== undefined && value !== null && value !== "") {
          requestBody[key] = value;
        }
      }
    });
  }

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
