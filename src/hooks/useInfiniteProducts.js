import { useInfiniteQuery } from '@tanstack/react-query';

const fetchProducts = async ({ pageParam = 1, queryKey }) => {
  const [, filters, categoryId, subcategoryId, sortBy] = queryKey;
  
  const requestBody = {
    page: pageParam,
    limit: 12
  };

  if (categoryId) {
    requestBody.category_id = categoryId;
  }
  
  if (subcategoryId) {
    requestBody.subcategory_id = subcategoryId;
  }

  if (typeof sortBy === 'number') {
    requestBody.sort = sortBy;
  }

  // Применяем фильтры
  if (filters) {
    requestBody.in_stock = filters.in_stock === true;

    if (Array.isArray(filters.material) && filters.material.length > 0) {
      // Для материалов отправляем как строку поиска, так как сервер ожидает поиск по названию
      requestBody.material_search = filters.material.join(' ');
    }

    if (filters.bestseller === true) {
      requestBody.bestseller = true;
    }

    if (Array.isArray(filters.colors) && filters.colors.length > 0) {
      requestBody.colors = filters.colors.map(color => parseInt(color));
    }

    if (filters.sizes && (
      (Number(filters.sizes.width) || 0) > 0 ||
      (Number(filters.sizes.height) || 0) > 0 ||
      (Number(filters.sizes.depth) || 0) > 0
    )) {
      requestBody.sizes = {
        width: Number(filters.sizes.width) || 0,
        height: Number(filters.sizes.height) || 0,
        depth: Number(filters.sizes.depth) || 0
      };
    }

    if (filters.price && (filters.price.min || filters.price.max)) {
      requestBody.price = {
        min: filters.price.min || 0,
        max: filters.price.max || 100000
      };
    }

    if (filters.search && filters.search.trim() !== "") {
      requestBody.search = filters.search.trim();
    }

    // Динамические фильтры
    Object.keys(filters).forEach(key => {
      if (!['price', 'in_stock', 'sort', 'material', 'colors', 'bestseller', 'sizes', 'search', 'category_id', 'subcategory_id'].includes(key)) {
        const value = filters[key];
        if (key === 'flag_type') {
          requestBody[key] = value;
        } else if (Array.isArray(value) && value.length > 0) {
          requestBody[key] = value;
        } else if (value !== undefined && value !== null && value !== '') {
          requestBody[key] = value;
        }
      }
    });
  }

  console.log('🚀 Sending request to API:', {
    url: '/api/products/models-list',
    requestBody,
    filters
  });

  const response = await fetch('/api/products/models-list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('accessToken') && {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }),
    },
    credentials: 'include',
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || 'Failed to fetch products');
  }

  const data = await response.json();
  

  return {
    products: data.results || [],
    totalCount: data.count || 0,
    currentPage: pageParam,
    hasNextPage: (data.results || []).length === 12 && (data.results || []).length > 0
  };
};

export const useInfiniteProducts = (filters, categoryId, subcategoryId, sortBy) => {
  const queryKey = ['products', filters, categoryId, subcategoryId, sortBy];
  
  return useInfiniteQuery({
    queryKey,
    queryFn: fetchProducts,
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasNextPage) {
        return lastPage.currentPage + 1;
      }
      return undefined;
    },
    refetchOnMount: false, // Не перезагружать при возврате
    refetchOnWindowFocus: false, // Не перезагружать при фокусе окна
  });
};
