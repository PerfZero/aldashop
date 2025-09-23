import { useQuery } from '@tanstack/react-query';

const fetchCategories = async () => {
  const response = await fetch('https://aldalinde.ru/api/products/category-list/');
  
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  
  return response.json();
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 30 * 60 * 1000, // 30 минут - категории меняются редко
    gcTime: 2 * 60 * 60 * 1000, // 2 часа
  });
};
