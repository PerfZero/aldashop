import { useQuery } from '@tanstack/react-query';

const fetchFilters = async (categoryId, subcategoryId) => {
  const requestBody = {};
  
  if (categoryId) {
    requestBody.category_id = categoryId;
  }
  
  if (subcategoryId) {
    requestBody.subcategory_id = subcategoryId;
  }
  
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

export const useFilters = (categoryId, subcategoryId) => {
  return useQuery({
    queryKey: ['filters', categoryId, subcategoryId],
    queryFn: () => fetchFilters(categoryId, subcategoryId),
    enabled: !!(categoryId || subcategoryId), // Запускать только если есть ID
    staleTime: 15 * 60 * 1000, // 15 минут
    gcTime: 60 * 60 * 1000, // 1 час
  });
};
