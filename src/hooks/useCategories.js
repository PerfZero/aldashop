import { useQuery } from "@tanstack/react-query";
import { getCategoriesApiUrl } from "../lib/publicApi";

const fetchCategories = async () => {
  const response = await fetch(getCategoriesApiUrl());

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    staleTime: 30 * 60 * 1000, // 30 минут - категории меняются редко
    gcTime: 2 * 60 * 60 * 1000, // 2 часа
  });
};
