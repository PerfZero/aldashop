'use client';
import { createContext, useState, useContext, useEffect } from 'react';
import { demoProducts } from './testData';
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
              name: `Товар ${item.product.id}`,
              price: item.product.price,
              image: item.product.photos?.[0]?.photo ? `http://62.181.44.89${item.product.photos[0].photo}` : '/sofa.png',
              quantity: item.quantity,
              article: `ART${item.product.id}`,
              inStock: item.product.in_stock,
              isBestseller: item.product.bestseller,
              color: item.product.color?.title,
              material: item.product.material?.title,
              dimensions: item.product.sizes ? `${item.product.sizes.width}×${item.product.sizes.height}×${item.product.sizes.depth} см` : null,
            })) || [];
            setCartItems(apiCartItems);
          } else {
            console.error('Ошибка загрузки корзины из API');
            loadFromLocalStorage();
          }
        } else {
          // Если пользователь не авторизован, загружаем из localStorage
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Ошибка при загрузке корзины:', error);
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
            console.error('Ошибка при загрузке корзины из localStorage:', error);
            setCartItems([]);
          }
        } else {
          // Если корзина пуста, добавляем демо-товары для демонстрации
          setCartItems([
            { ...demoProducts[0], quantity: 1 },
            { ...demoProducts[1], quantity: 1 }
          ]);
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
              name: `Товар ${item.product.id}`,
              price: item.product.price,
              image: item.product.photos?.[0]?.photo ? `http://62.181.44.89${item.product.photos[0].photo}` : '/sofa.png',
              quantity: item.quantity,
              article: `ART${item.product.id}`,
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
          console.error('Ошибка добавления товара в корзину');
        }
      } catch (error) {
        console.error('Ошибка при добавлении товара в корзину:', error);
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

  // Удаление товара из корзины
  const removeFromCart = async (productId) => {
    if (isAuthenticated) {
      try {
        let headers = getAuthHeaders();
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
              name: `Товар ${item.product.id}`,
              price: item.product.price,
              image: item.product.photos?.[0]?.photo ? `http://62.181.44.89${item.product.photos[0].photo}` : '/sofa.png',
              quantity: item.quantity,
              article: `ART${item.product.id}`,
              inStock: item.product.in_stock,
              isBestseller: item.product.bestseller,
              color: item.product.color?.title,
              material: item.product.material?.title,
              dimensions: item.product.sizes ? `${item.product.sizes.width}×${item.product.sizes.height}×${item.product.sizes.depth} см` : null,
            })) || [];
            setCartItems(apiCartItems);
            toast.success('Товар удален из корзины');
          }
        } else {
          toast.error('Ошибка при удалении товара');
        }
      } catch (error) {
        console.error('Ошибка при удалении товара:', error);
        toast.error('Ошибка при удалении товара');
      }
    } else {
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
      toast.success('Товар удален из корзины');
    }
  };

  // Обновление количества товара
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      // Если количество меньше или равно 0, удаляем товар
      removeFromCart(productId);
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
            name: `Товар ${item.product.id}`,
            price: item.product.price,
            image: item.product.photos?.[0]?.photo ? `http://62.181.44.89${item.product.photos[0].photo}` : '/sofa.png',
            quantity: item.quantity,
            article: `ART${item.product.id}`,
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
        console.error('Ошибка при обновлении количества:', error);
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