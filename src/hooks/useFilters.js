import { useQuery } from '@tanstack/react-query';

const fetchFilters = async (categoryId, subcategoryId, dynamicFilters = {}) => {
  const requestBody = {};
  
  if (categoryId) {
    requestBody.category_id = categoryId;
  }
  
  if (subcategoryId) {
    requestBody.subcategory_id = subcategoryId;
  }
  
  // Добавляем динамические фильтры (включая флаги)
  Object.keys(dynamicFilters).forEach(key => {
    if (!['category_id', 'subcategory_id'].includes(key)) {
      requestBody[key] = dynamicFilters[key];
    }
  });
  
  const response = await fetch('/api/products/subcategory-filters', {
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
    throw new Error(errorData.error || 'Failed to fetch filters');
  }
  
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

export const useFilters = (categoryId, subcategoryId, dynamicFilters = {}) => {
  return useQuery({
    queryKey: ['filters', categoryId, subcategoryId],
    queryFn: () => fetchFilters(categoryId, subcategoryId, dynamicFilters),
    enabled: !!(categoryId || subcategoryId), // Запускать только если есть ID
    staleTime: 15 * 60 * 1000, // 15 минут
    gcTime: 60 * 60 * 1000, // 1 час
  });
};
