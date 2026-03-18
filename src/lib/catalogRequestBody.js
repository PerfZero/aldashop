const RESERVED_FILTER_KEYS = new Set([
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
]);

export function buildCatalogRequestBody({
  filters = {},
  categoryId,
  subcategoryId,
  sortBy,
  page,
  limit,
  includePagination = true,
}) {
  const requestBody = {};

  if (includePagination) {
    requestBody.page = page;
    requestBody.limit = limit;
  }

  if (categoryId) {
    requestBody.category_id = categoryId;
  }

  if (subcategoryId) {
    requestBody.subcategory_id = subcategoryId;
  }

  if (typeof sortBy === "number") {
    requestBody.sort = sortBy;
  }

  if (!filters || typeof filters !== "object") {
    return requestBody;
  }

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
    requestBody.colors = filters.colors.map((color) => parseInt(color, 10));
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

  if (filters.price && (filters.price.min !== undefined || filters.price.max !== undefined)) {
    requestBody.price = {};

    if (filters.price.min !== undefined) {
      requestBody.price.min = filters.price.min;
    }

    if (filters.price.max !== undefined) {
      requestBody.price.max = filters.price.max;
    }
  }

  if (typeof filters.search === "string" && filters.search.trim() !== "") {
    requestBody.search = filters.search.trim();
  }

  Object.keys(filters).forEach((key) => {
    if (RESERVED_FILTER_KEYS.has(key)) {
      return;
    }

    const value = filters[key];

    if (key === "flag_type") {
      requestBody[key] = value;
      return;
    }

    if (Array.isArray(value) && value.length > 0) {
      requestBody[key] = value;
      return;
    }

    if (value !== undefined && value !== null && value !== "") {
      requestBody[key] = value;
    }
  });

  return requestBody;
}
