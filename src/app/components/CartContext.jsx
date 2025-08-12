'use client';
import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

// Создаем контекст
const CartContext = createContext();

// Провайдер контекста
export function CartProvider({ children }) {
  // Инициализируем состояние корзины из localStorage при загрузке
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated, getAuthHeaders, refreshToken } = useAuth();

     // Загружаем данные корзины из API или localStorage
   useEffect(() => {
     const loadCart = async () => {
             setIsLoading(true);
      
      try {
        // Если пользователь авторизован, загружаем корзину из API
        if (isAuthenticated) {
          let headers = getAuthHeaders();
          let response = await fetch('/api/user/cart', {
            headers,
          });
          
          // Если токен истек, пробуем обновить и повторить запрос
          if (response.status === 401) {
            const refreshResult = await refreshToken();
            if (refreshResult.success) {
              headers = getAuthHeaders();
              response = await fetch('/api/user/cart', {
                headers,
              });
            }
          }
          
          if (response.ok) {
            const data = await response.json();
            // Преобразуем данные из API в формат корзины
            const apiCartItems = (data.results || data).map(item => ({
              id: item.product.id,
              name: item.product.title || `Товар ${item.product.id}`,
              price: item.product.price,
              image: item.product.photos?.[0]?.photo ? `https://aldalinde.ru${item.product.photos[0].photo}` : '/sofa.png',
              quantity: item.quantity,
              article: item.product.generated_article || `ART${item.product.id}`,
              inStock: item.product.in_stock,
              isBestseller: item.product.bestseller,
              color: item.product.color?.title,
              material: item.product.material?.title,
              dimensions: item.product.sizes ? `${item.product.sizes.width}×${item.product.sizes.height}×${item.product.sizes.depth} см` : null,
            })) || [];
            setCartItems(apiCartItems);
          } else {
            loadFromLocalStorage();
          }
        } else {
          // Если пользователь не авторизован, загружаем из localStorage
          loadFromLocalStorage();
        }
      } catch (error) {
        loadFromLocalStorage();
      }
      setIsLoaded(true);
      setIsLoading(false);
    };

                   const loadFromLocalStorage = () => {
        if (typeof window !== 'undefined') {
          const storedCart = localStorage.getItem('cart');
          if (storedCart) {
            try {
              setCartItems(JSON.parse(storedCart));
            } catch (error) {
              setCartItems([]);
            }
          } else {
            setCartItems([]);
          }
        }
      };

    loadCart();
  }, [isAuthenticated, getAuthHeaders, refreshToken]);

             // Сохраняем корзину в localStorage только для неавторизованных пользователей
  useEffect(() => {
    if (isLoaded && !isAuthenticated && typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded, isAuthenticated]);

  // Очищаем localStorage при авторизации (данные уже слиты с сервером)
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      const cartData = localStorage.getItem('cart');
      if (cartData) {
        console.log('[CartContext] User authenticated, clearing localStorage cart data');
        localStorage.removeItem('cart');
      }
    }
  }, [isAuthenticated]);

  // Добавление товара в корзину
  const addToCart = async (product) => {
    if (isAuthenticated) {
      // Для авторизованных пользователей добавляем через API
      try {
        let headers = getAuthHeaders();
        let response = await fetch('/api/user/cart', {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: product.id,
            quantity: 1,
          }),
        });

        // Если токен истек, пробуем обновить и повторить запрос
        if (response.status === 401) {
          const refreshResult = await refreshToken();
          if (refreshResult.success) {
            headers = getAuthHeaders();
            response = await fetch('/api/user/cart', {
              method: 'POST',
              headers: {
                ...headers,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                product_id: product.id,
                quantity: 1,
              }),
            });
          }
        }

        if (response.ok) {
          // После успешного добавления перезагружаем корзину
          let cartResponse = await fetch('/api/user/cart', {
            headers,
          });
          
          // Если токен истек при загрузке корзины, пробуем обновить
          if (cartResponse.status === 401) {
            const refreshResult = await refreshToken();
            if (refreshResult.success) {
              headers = getAuthHeaders();
              cartResponse = await fetch('/api/user/cart', {
                headers,
              });
            }
          }
          
          if (cartResponse.ok) {
            const data = await cartResponse.json();
            const apiCartItems = (data.results || data).map(item => ({
              id: item.product.id,
              name: item.product.title || `Товар ${item.product.id}`,
              price: item.product.price,
              image: item.product.photos?.[0]?.photo ? `https://aldalinde.ru${item.product.photos[0].photo}` : '/sofa.png',
              quantity: item.quantity,
              article: item.product.generated_article || `ART${item.product.id}`,
              inStock: item.product.in_stock,
              isBestseller: item.product.bestseller,
              color: item.product.color?.title,
              material: item.product.material?.title,
              dimensions: item.product.sizes ? `${item.product.sizes.width}×${item.product.sizes.height}×${item.product.sizes.depth} см` : null,
            })) || [];
            setCartItems(apiCartItems);
            toast.success('Товар добавлен в корзину!');
          }
        } else {
        }
      } catch (error) {
      }
    } else {
      // Для неавторизованных пользователей работаем с localStorage
      setCartItems(prevItems => {
        const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
        
        if (existingItemIndex >= 0) {
          const updatedItems = [...prevItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + 1
          };
          return updatedItems;
        } else {
          return [...prevItems, { ...product, quantity: 1 }];
        }
      });
      toast.success('Товар добавлен в корзину!');
    }
  };

  // Удаление товара из корзины (уменьшение количества или полное удаление)
  const removeFromCart = async (productId, removeAll = false) => {
    console.log('[CartContext] removeFromCart called:', { productId, removeAll });
    
    if (isAuthenticated) {
      try {
        let headers = getAuthHeaders();
        
        // Определяем логику удаления
        let shouldRemoveAll = removeAll;
        if (!removeAll) {
          // При обычном клике на крестик удаляем весь товар
          shouldRemoveAll = true;
        }
        
        const url = shouldRemoveAll 
          ? `/api/user/cart/${productId}/?all=true`
          : `/api/user/cart/${productId}`;
        
        console.log('[CartContext] Making DELETE request to:', url);
        console.log('[CartContext] shouldRemoveAll:', shouldRemoveAll);
          
        let response = await fetch(url, {
          method: 'DELETE',
          headers,
        });

        if (response.status === 401) {
          const refreshResult = await refreshToken();
          if (refreshResult.success) {
            headers = getAuthHeaders();
            response = await fetch(url, {
              method: 'DELETE',
              headers,
            });
          }
        }

        if (response.ok || response.status === 204) {
          // Перезагружаем корзину после удаления
          let cartResponse = await fetch('/api/user/cart', {
            headers,
          });
          
          if (cartResponse.status === 401) {
            const refreshResult = await refreshToken();
            if (refreshResult.success) {
              headers = getAuthHeaders();
              cartResponse = await fetch('/api/user/cart', {
                headers,
              });
            }
          }
          
          if (cartResponse.ok) {
            const data = await cartResponse.json();
            const apiCartItems = (data.results || data).map(item => ({
              id: item.product.id,
              name: item.product.title || `Товар ${item.product.id}`,
              price: item.product.price,
              image: item.product.photos?.[0]?.photo ? `https://aldalinde.ru${item.product.photos[0].photo}` : '/sofa.png',
              quantity: item.quantity,
              article: item.product.generated_article || `ART${item.product.id}`,
              inStock: item.product.in_stock,
              isBestseller: item.product.bestseller,
              color: item.product.color?.title,
              material: item.product.material?.title,
              dimensions: item.product.sizes ? `${item.product.sizes.width}×${item.product.sizes.height}×${item.product.sizes.depth} см` : null,
            })) || [];
            setCartItems(apiCartItems);
            
            if (shouldRemoveAll) {
              toast.success('Товар удален из корзины');
            } else {
              toast.success('Количество уменьшено');
            }
          }
        } else {
          toast.error('Ошибка при удалении товара');
        }
      } catch (error) {
        toast.error('Ошибка при удалении товара');
      }
    } else {
      // Для неавторизованных пользователей
      setCartItems(prevItems => {
        const currentItem = prevItems.find(item => item.id === productId);
        if (!currentItem) return prevItems;
        
        // При обычном клике на крестик удаляем весь товар
        if (!removeAll || removeAll) {
          return prevItems.filter(item => item.id !== productId);
        } else {
          return prevItems.map(item => 
            item.id === productId 
              ? { ...item, quantity: item.quantity - 1 }
              : item
          );
        }
      });
      
      toast.success('Товар удален из корзины');
    }
  };

  // Полное удаление товара из корзины
  const removeAllFromCart = async (productId) => {
    return removeFromCart(productId, true);
  };

  // Обновление количества товара
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      // Если количество меньше или равно 0, полностью удаляем товар
      removeFromCart(productId, true);
      return;
    }

    if (isAuthenticated) {
      // Для авторизованных пользователей обновляем через API
      try {
        let headers = getAuthHeaders();
        
        // Получаем текущее количество товара
        const currentItem = cartItems.find(item => item.id === productId);
        const currentQuantity = currentItem ? currentItem.quantity : 0;
        
        // Если количество не изменилось, ничего не делаем
        if (newQuantity === currentQuantity) {
          return;
        }
        
        if (newQuantity > currentQuantity) {
          // Увеличиваем количество - добавляем разницу
          const difference = newQuantity - currentQuantity;
          let response = await fetch('/api/user/cart', {
            method: 'POST',
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              product_id: productId,
              quantity: difference,
            }),
          });

          if (response.status === 401) {
            const refreshResult = await refreshToken();
            if (refreshResult.success) {
              headers = getAuthHeaders();
              response = await fetch('/api/user/cart', {
                method: 'POST',
                headers: {
                  ...headers,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  product_id: productId,
                  quantity: difference,
                }),
              });
            }
          }
        } else if (newQuantity < currentQuantity) {
          // Уменьшаем количество - удаляем разницу
          const difference = currentQuantity - newQuantity;
          for (let i = 0; i < difference; i++) {
            let response = await fetch(`/api/user/cart/${productId}`, {
              method: 'DELETE',
              headers,
            });

            if (response.status === 401) {
              const refreshResult = await refreshToken();
              if (refreshResult.success) {
                headers = getAuthHeaders();
                response = await fetch(`/api/user/cart/${productId}`, {
                  method: 'DELETE',
                  headers,
                });
              }
            }
            
            // Если товар полностью удален (статус 204), прерываем цикл
            if (response.status === 204) {
              break;
            }
          }
        }

        // Перезагружаем корзину после обновления
        let cartResponse = await fetch('/api/user/cart', {
          headers,
        });
        
        if (cartResponse.status === 401) {
          const refreshResult = await refreshToken();
          if (refreshResult.success) {
            headers = getAuthHeaders();
            cartResponse = await fetch('/api/user/cart', {
              headers,
            });
          }
        }
        
        if (cartResponse.ok) {
          const data = await cartResponse.json();
          const apiCartItems = (data.results || data).map(item => ({
            id: item.product.id,
            name: item.product.title || `Товар ${item.product.id}`,
            price: item.product.price,
            image: item.product.photos?.[0]?.photo ? `https://aldalinde.ru${item.product.photos[0].photo}` : '/sofa.png',
            quantity: item.quantity,
            article: item.product.generated_article || `ART${item.product.id}`,
            inStock: item.product.in_stock,
            isBestseller: item.product.bestseller,
            color: item.product.color?.title,
            material: item.product.material?.title,
            dimensions: item.product.sizes ? `${item.product.sizes.width}×${item.product.sizes.height}×${item.product.sizes.depth} см` : null,
          })) || [];
          setCartItems(apiCartItems);
          toast.success('Количество обновлено');
        }
      } catch (error) {
        toast.error('Ошибка при обновлении количества');
      }
    } else {
      // Для неавторизованных пользователей работаем с локальным состоянием
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === productId 
            ? { ...item, quantity: newQuantity } 
            : item
        )
      );
    }
  };

  // Очистка корзины
  const clearCart = () => {
    setCartItems([]);
  };

  // Значение контекста
  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    removeAllFromCart,
    updateQuantity,
    clearCart,
    isLoading
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

// Хук для использования контекста корзины
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart должен использоваться внутри CartProvider');
  }
  return context;
} 