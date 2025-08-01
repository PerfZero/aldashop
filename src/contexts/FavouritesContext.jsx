'use client';
import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const FavouritesContext = createContext();

export function FavouritesProvider({ children }) {
  const [favourites, setFavourites] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, getAuthHeaders, refreshToken } = useAuth();

  // Загружаем избранные товары при инициализации
  useEffect(() => {
    if (isAuthenticated) {
      loadFavourites();
    } else {
      // Для неавторизованных пользователей загружаем из localStorage
      loadFromLocalStorage();
    }
  }, [isAuthenticated]);

  const loadFavourites = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      let headers = getAuthHeaders();
      let response = await fetch('/api/user/favourites', {
        headers,
      });

      if (response.status === 401) {
        const refreshResult = await refreshToken();
        if (refreshResult.success) {
          headers = getAuthHeaders();
          response = await fetch('/api/user/favourites', {
            headers,
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        const favouritesList = (data.results || data).map(item => {
          const product = item.product;
          const mainPhoto = product.photos?.find(photo => photo.main_photo) || product.photos?.[0];
          const secondaryPhoto = product.photos?.find(photo => !photo.main_photo) || product.photos?.[1];
          
          return {
            id: product.id,
            name: product.title || `Товар ${product.id}`,
            price: product.price,
            discountedPrice: product.discounted_price,
            image: mainPhoto?.photo ? `http://62.181.44.89${mainPhoto.photo}` : '/sofa.png',
            hoverImage: secondaryPhoto?.photo ? `http://62.181.44.89${secondaryPhoto.photo}` : null,
            article: product.article || `ART${product.id}`,
            inStock: product.in_stock,
            isBestseller: product.bestseller,
            available_sizes: product.available_sizes || [],
            available_colors: product.available_colors || [],
            available_materials: product.available_materials || [],
            description: product.description,
            weight: product.weight,
            delivery: product.delivery,
            production_time: product.production_time,
          };
        }) || [];
        setFavourites(favouritesList);
      }
    } catch (error) {
      console.error('Ошибка при загрузке избранного:', error);
    }
    setIsLoading(false);
  };

  const loadFromLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const storedFavourites = localStorage.getItem('favourites');
      if (storedFavourites) {
        try {
          setFavourites(JSON.parse(storedFavourites));
        } catch (error) {
          console.error('Ошибка при загрузке избранного из localStorage:', error);
          setFavourites([]);
        }
      }
    }
  };

  // Сохраняем в localStorage для неавторизованных пользователей
  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined') {
      localStorage.setItem('favourites', JSON.stringify(favourites));
    }
  }, [favourites, isAuthenticated]);

  const addToFavourites = async (product) => {
    if (isAuthenticated) {
      try {
        let headers = getAuthHeaders();
        let response = await fetch('/api/user/favourites', {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: product.id,
          }),
        });

        if (response.status === 401) {
          const refreshResult = await refreshToken();
          if (refreshResult.success) {
            headers = getAuthHeaders();
            response = await fetch('/api/user/favourites', {
              method: 'POST',
              headers: {
                ...headers,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                product_id: product.id,
              }),
            });
          }
        }

        if (response.ok) {
          await loadFavourites();
          toast.success('Товар добавлен в избранное!');
        } else if (response.status === 400) {
          toast.error('Товар уже в избранном');
        } else {
          toast.error('Ошибка при добавлении в избранное');
        }
      } catch (error) {
        console.error('Ошибка при добавлении в избранное:', error);
        toast.error('Ошибка при добавлении в избранное');
      }
    } else {
      // Для неавторизованных пользователей работаем с localStorage
      setFavourites(prev => {
        const isAlreadyFavourite = prev.some(item => item.id === product.id);
        if (isAlreadyFavourite) {
          toast.error('Товар уже в избранном');
          return prev;
        }
        const newFavourites = [...prev, {
          id: product.id,
          name: product.name || `Товар ${product.id}`,
          price: product.price,
          image: product.image || '/sofa.png',
          article: product.article || `ART${product.id}`,
          inStock: product.inStock,
          isBestseller: product.isBestseller,
          color: product.color,
          material: product.material,
          dimensions: product.dimensions,
        }];
        toast.success('Товар добавлен в избранное!');
        return newFavourites;
      });
    }
  };

  const removeFromFavourites = async (productId) => {
    if (isAuthenticated) {
      try {
        let headers = getAuthHeaders();
        let response = await fetch(`/api/user/favourites/${productId}`, {
          method: 'DELETE',
          headers,
        });

        if (response.status === 401) {
          const refreshResult = await refreshToken();
          if (refreshResult.success) {
            headers = getAuthHeaders();
            response = await fetch(`/api/user/favourites/${productId}`, {
              method: 'DELETE',
              headers,
            });
          }
        }

        if (response.ok || response.status === 204) {
          await loadFavourites();
          toast.success('Товар удален из избранного');
        } else {
          toast.error('Ошибка при удалении из избранного');
        }
      } catch (error) {
        console.error('Ошибка при удалении из избранного:', error);
        toast.error('Ошибка при удалении из избранного');
      }
    } else {
      // Для неавторизованных пользователей работаем с localStorage
      setFavourites(prev => prev.filter(item => item.id !== productId));
      toast.success('Товар удален из избранного');
    }
  };

  const isFavourite = (productId) => {
    return favourites.some(item => item.id === productId);
  };

  const toggleFavourite = async (product) => {
    if (isFavourite(product.id)) {
      await removeFromFavourites(product.id);
    } else {
      await addToFavourites(product);
    }
  };

  const contextValue = {
    favourites,
    addToFavourites,
    removeFromFavourites,
    toggleFavourite,
    isFavourite,
    isLoading,
    loadFavourites
  };

  return (
    <FavouritesContext.Provider value={contextValue}>
      {children}
    </FavouritesContext.Provider>
  );
}

export function useFavourites() {
  const context = useContext(FavouritesContext);
  if (!context) {
    throw new Error('useFavourites должен использоваться внутри FavouritesProvider');
  }
  return context;
} 