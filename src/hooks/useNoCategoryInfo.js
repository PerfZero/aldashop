import { useQuery } from '@tanstack/react-query';

const fetchNoCategoryInfo = async () => {
  const response = await fetch('https://aldalinde.ru/api/products/get_info_no_category');
  
  if (!response.ok) {
    throw new Error('Failed to fetch no category info');
  }
  
  const data = await response.json();
  return data.success ? data.data : null;
};

export const useNoCategoryInfo = (enabled = true) => {
  return useQuery({
    queryKey: ['noCategoryInfo'],
    queryFn: fetchNoCategoryInfo,
    enabled,
    staleTime: 30 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
  });
};
