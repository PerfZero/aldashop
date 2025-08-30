'use client';
import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';


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
        console.log('[FavouritesContext] API response:', data);
        const favouritesList = (data.results || data).map(item => {
          const product = item.product;
          const mainPhoto = product.photos?.find(photo => photo.main_photo) || product.photos?.[0];
          const secondaryPhoto = product.photos?.find(photo => !photo.main_photo) || product.photos?.[1];
          
          return {
            id: product.id,
            title: product.title || `Товар ${product.id}`,
            name: product.title || `Товар ${product.id}`,
            price: product.price || 0,
            discountedPrice: product.discounted_price || null,
            image: mainPhoto?.photo ? `https://aldalinde.ru${mainPhoto.photo}` : '/placeholder.jpg',
            hoverImage: secondaryPhoto?.photo ? `https://aldalinde.ru${secondaryPhoto.photo}` : null,
            article: product.generated_article || `ART${product.id}`,
            inStock: product.in_stock || false,
            isBestseller: product.bestseller || false,
            color: product.color?.title || null,
            material: product.material?.title || null,
            dimensions: product.sizes ? `${product.sizes.width}×${product.sizes.height}×${product.sizes.depth} см` : null,
            weight: product.weight || null,
            delivery: product.delivery || null,
            production_time: product.production_time || null,
            date_create: item.date_create || null,
            product: {
              id: product.id,
              title: product.title,
              price: product.price,
              discounted_price: product.discounted_price,
              photos: product.photos,
              in_stock: product.in_stock,
              bestseller: product.bestseller,
              generated_article: product.generated_article,
              color: product.color,
              material: product.material,
              sizes: product.sizes,
              weight: product.weight,
              delivery: product.delivery,
              production_time: product.production_time
            }
          };
        }) || [];
        setFavourites(favouritesList);
      }
    } catch (error) {
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

  // Очищаем localStorage при авторизации (данные уже слиты с сервером)
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      const favouritesData = localStorage.getItem('favourites');
      if (favouritesData) {
        console.log('[FavouritesContext] User authenticated, clearing localStorage favourites data');
        localStorage.removeItem('favourites');
      }
    }
  }, [isAuthenticated]);

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
        } else if (response.status === 400) {
        } else {
        }
      } catch (error) {
      }
    } else {
      // Для неавторизованных пользователей работаем с localStorage
      setFavourites(prev => {
        const isAlreadyFavourite = prev.some(item => item.id === product.id);
        if (isAlreadyFavourite) {
          return prev;
        }
                 const newFavourites = [...prev, {
           id: product.id,
           title: product.name || product.title || `Товар ${product.id}`,
           name: product.name || product.title || `Товар ${product.id}`,
           price: product.price || 0,
           discountedPrice: product.discountedPrice || product.discounted_price || null,
           image: product.image || '/placeholder.jpg',
           article: product.article || product.generated_article || `ART${product.id}`,
           inStock: product.inStock || product.in_stock || false,
           isBestseller: product.isBestseller || product.bestseller || false,
           color: product.color || null,
           material: product.material || null,
           dimensions: product.dimensions || null,
           product: {
             id: product.id,
             title: product.name || product.title,
             price: product.price,
             discounted_price: product.discountedPrice || product.discounted_price,
             photos: product.photos || [],
             in_stock: product.inStock || product.in_stock,
             bestseller: product.isBestseller || product.bestseller,
             generated_article: product.article || product.generated_article,
             color: product.color,
             material: product.material,
             sizes: product.sizes,
             weight: product.weight,
             delivery: product.delivery,
             production_time: product.production_time
           }
         }];
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
        } else {
        }
      } catch (error) {
      }
    } else {
      // Для неавторизованных пользователей работаем с localStorage
      setFavourites(prev => prev.filter(item => item.id !== productId));
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