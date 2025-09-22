'use client';
import { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';


// Создаем контекст
const CartContext = createContext();

// Провайдер контекста
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const { isAuthenticated, getAuthHeaders, refreshToken } = useAuth();

     // Загружаем данные корзины из API или localStorage
   useEffect(() => {
     const loadCart = async () => {
      
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
            setCartItems([]);
          }
        } else {
          // Если пользователь не авторизован, загружаем через API с сессией
          try {
            const response = await fetch('https://aldalinde.ru/api/user/cart/', {
              credentials: 'include',
            });
            
            if (response.ok) {
              const data = await response.json();
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
              setCartItems([]);
            }
          } catch (error) {
            setCartItems([]);
          }
        }
      } catch (error) {
        setCartItems([]);
      }
    };


    loadCart();
  }, [isAuthenticated]);


  // Добавление товара в корзину
  const addToCart = async (product) => {
    if (!isAuthenticated) {
      // Для неавторизованных пользователей используем API через сессию
      try {
        const response = await fetch('https://aldalinde.ru/api/user/cart/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            product_id: product.id,
            quantity: product.quantity || 1,
          }),
        });

        if (response.ok) {
          // После успешного добавления перезагружаем корзину
          const cartResponse = await fetch('https://aldalinde.ru/api/user/cart/', {
            credentials: 'include',
          });
          
          if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            const apiCartItems = (cartData.results || cartData).map(item => ({
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
          }
        }
      } catch (error) {
        console.error('Ошибка при добавлении в корзину (неавторизованный):', error);
      }
      return;
    }

    try {
      let headers = getAuthHeaders();
      
      const requestBody = {
        product_id: product.id,
        quantity: product.quantity || 1,
      };
      
      let response = await fetch('/api/user/cart', {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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
              quantity: product.quantity || 1,
            }),
          });
        }
      }

      if (response.ok) {
        const data = await response.json();
        
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
          const cartData = await cartResponse.json();
          
          const apiCartItems = (cartData.results || cartData).map(item => ({
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
        }
      } else {
        const errorData = await response.json();
        console.error('Ошибка при добавлении в корзину:', response.status, errorData);
      }
    } catch (error) {
      console.error('Ошибка в addToCart:', error);
    }
  };

  // Удаление товара из корзины (уменьшение количества или полное удаление)
  const removeFromCart = async (productId, removeAll = false) => {
    if (!isAuthenticated) {
      // Для неавторизованных пользователей используем API через сессию
      try {
        const url = removeAll 
          ? `https://aldalinde.ru/api/user/cart//${productId}/?all=true`
          : `https://aldalinde.ru/api/user/cart//${productId}/`;
          
        const response = await fetch(url, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          // После успешного удаления перезагружаем корзину
          const cartResponse = await fetch('https://aldalinde.ru/api/user/cart/', {
            credentials: 'include',
          });
          
          if (cartResponse.ok) {
            const cartData = await cartResponse.json();
            const apiCartItems = (cartData.results || cartData).map(item => ({
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
          }
        }
      } catch (error) {
        console.error('Ошибка при удалении из корзины (неавторизованный):', error);
      }
      return;
    }

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
        console.log('Товар успешно удален из корзины');
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
          console.log('Корзина обновлена после удаления:', apiCartItems);
        } else {
          console.error('Ошибка при загрузке корзины после удаления:', cartResponse.status);
        }
      } else {
        console.error('Ошибка при удалении из корзины:', response.status);
      }
    } catch (error) {
      console.error('Ошибка в removeFromCart:', error);
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

    if (!isAuthenticated) {
      // Для неавторизованных пользователей используем API через сессию
      try {
        // Получаем текущее количество товара
        const currentItem = cartItems.find(item => item.id === productId);
        const currentQuantity = currentItem ? currentItem.quantity : 0;
        
        // Если количество не изменилось, ничего не делаем
        if (newQuantity === currentQuantity) {
          return;
        }
        
        // Оптимистично обновляем локальное состояние
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.id === productId 
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        
        if (newQuantity > currentQuantity) {
          // Увеличиваем количество - добавляем разницу
          const difference = newQuantity - currentQuantity;
          const response = await fetch('https://aldalinde.ru/api/user/cart/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              product_id: productId,
              quantity: difference,
            }),
          });

          if (!response.ok) {
            // Если запрос не удался, откатываем изменения
            setCartItems(prevItems => 
              prevItems.map(item => 
                item.id === productId 
                  ? { ...item, quantity: currentQuantity }
                  : item
              )
            );
          }
        } else if (newQuantity < currentQuantity) {
          // Уменьшаем количество - удаляем разницу
          const difference = currentQuantity - newQuantity;
          let allRequestsSuccessful = true;
          
          for (let i = 0; i < difference; i++) {
            const response = await fetch(`https://aldalinde.ru/api/user/cart//${productId}`, {
              method: 'DELETE',
              credentials: 'include',
            });
            
            if (!response.ok && response.status !== 204) {
              allRequestsSuccessful = false;
            }
            
            // Если товар полностью удален (статус 204), прерываем цикл
            if (response.status === 204) {
              break;
            }
          }
          
          if (!allRequestsSuccessful) {
            // Если запросы не удались, откатываем изменения
            setCartItems(prevItems => 
              prevItems.map(item => 
                item.id === productId 
                  ? { ...item, quantity: currentQuantity }
                  : item
              )
            );
          }
        }
      } catch (error) {
        console.error('Ошибка при обновлении количества (неавторизованный):', error);
        // При ошибке откатываем изменения
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.id === productId 
              ? { ...item, quantity: currentQuantity }
              : item
          )
        );
      }
      return;
    }

    try {
      let headers = getAuthHeaders();
      
      // Получаем текущее количество товара
      const currentItem = cartItems.find(item => item.id === productId);
      const currentQuantity = currentItem ? currentItem.quantity : 0;
      
      // Если количество не изменилось, ничего не делаем
      if (newQuantity === currentQuantity) {
        return;
      }
      
      // Оптимистично обновляем локальное состояние
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === productId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      
      let allRequestsSuccessful = true;
      
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
        
        if (!response.ok) {
          allRequestsSuccessful = false;
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
          
          if (!response.ok && response.status !== 204) {
            allRequestsSuccessful = false;
          }
          
          // Если товар полностью удален (статус 204), прерываем цикл
          if (response.status === 204) {
            break;
          }
        }
      }
      
      if (!allRequestsSuccessful) {
        // Если запросы не удались, откатываем изменения
        setCartItems(prevItems => 
          prevItems.map(item => 
            item.id === productId 
              ? { ...item, quantity: currentQuantity }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Ошибка в updateQuantity:', error);
      // При ошибке откатываем изменения
      const currentItem = cartItems.find(item => item.id === productId);
      const currentQuantity = currentItem ? currentItem.quantity : 0;
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.id === productId 
            ? { ...item, quantity: currentQuantity }
            : item
        )
      );
    }
  };

  // Очистка корзины
  const clearCart = () => {
    setCartItems([]);
  };

  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    removeAllFromCart,
    updateQuantity,
    clearCart
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