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
    if (filters.in_stock === true) {
      requestBody.in_stock = true;
    }

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

    if (filters.sizes) {
      const sizesData = {};
      
      if (filters.sizes.width) {
        sizesData.width = {
          min: Number(filters.sizes.width.min) || 0,
          max: Number(filters.sizes.width.max) || 0
        };
      }
      
      if (filters.sizes.height) {
        sizesData.height = {
          min: Number(filters.sizes.height.min) || 0,
          max: Number(filters.sizes.height.max) || 0
        };
      }
      
      if (filters.sizes.depth) {
        sizesData.depth = {
          min: Number(filters.sizes.depth.min) || 0,
          max: Number(filters.sizes.depth.max) || 0
        };
      }
      
      if (Object.keys(sizesData).length > 0) {
        requestBody.sizes = sizesData;
      }
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
  const serializedFilters = JSON.stringify(filters || {});
  const queryKey = ['products', filters, categoryId, subcategoryId, sortBy, serializedFilters];
  
  console.log('🔵 useInfiniteProducts query key:', queryKey);
  
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
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
