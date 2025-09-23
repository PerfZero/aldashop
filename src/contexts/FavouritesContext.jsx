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
      // Для неавторизованных пользователей загружаем через API с сессией
      loadFavouritesForUnauthenticated();
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
          const secondaryPhoto = product.photos?.find(photo => !photo.main_photo && !photo.photo_interior) || product.photos?.[1];
          
          return {
            id: product.id,
            title: product.title || `Товар ${product.id}`,
            name: product.title || `Товар ${product.id}`,
            price: product.price || 0,
            discountedPrice: product.discounted_price || null,
            image: mainPhoto?.photo ? (mainPhoto.photo.startsWith('http') ? mainPhoto.photo : `https://aldalinde.ru${mainPhoto.photo}`) : null,
            hoverImage: secondaryPhoto?.photo ? (secondaryPhoto.photo.startsWith('http') ? secondaryPhoto.photo : `https://aldalinde.ru${secondaryPhoto.photo}`) : null,
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

  const loadFavouritesForUnauthenticated = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://aldalinde.ru/api/user/favourites/');

      if (response.ok) {
        const data = await response.json();
        const favouritesList = (data.results || data).map(item => {
          const product = item.product;
          const mainPhoto = product.photos?.find(photo => photo.main_photo) || product.photos?.[0];
          const secondaryPhoto = product.photos?.find(photo => !photo.main_photo && !photo.photo_interior) || product.photos?.[1];
          
          return {
            id: product.id,
            title: product.title || `Товар ${product.id}`,
            name: product.title || `Товар ${product.id}`,
            price: product.price || 0,
            discountedPrice: product.discounted_price || null,
            image: mainPhoto?.photo ? (mainPhoto.photo.startsWith('http') ? mainPhoto.photo : `https://aldalinde.ru${mainPhoto.photo}`) : null,
            hoverImage: secondaryPhoto?.photo ? (secondaryPhoto.photo.startsWith('http') ? secondaryPhoto.photo : `https://aldalinde.ru${secondaryPhoto.photo}`) : null,
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
      } else {
        setFavourites([]);
      }
        } catch (error) {
          setFavourites([]);
        }
    setIsLoading(false);
  };


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
      // Для неавторизованных пользователей работаем через API с сессией
      try {
        const response = await fetch('https://aldalinde.ru/api/user/favourites/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: product.id,
          }),
        });

        if (response.ok) {
          await loadFavouritesForUnauthenticated();
        }
      } catch (error) {
        console.error('Ошибка при добавлении в избранное (неавторизованный):', error);
      }
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
      // Для неавторизованных пользователей работаем через API с сессией
      try {
        const response = await fetch(`https://aldalinde.ru/api/user/favourites/${productId}/`, {
          method: 'DELETE',
        });

        if (response.ok || response.status === 204) {
          await loadFavouritesForUnauthenticated();
        }
      } catch (error) {
        console.error('Ошибка при удалении из избранного (неавторизованный):', error);
      }
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