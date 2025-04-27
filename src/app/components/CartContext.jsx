'use client';
import { createContext, useState, useContext, useEffect } from 'react';
import { demoProducts } from './testData';

// Создаем контекст
const CartContext = createContext();

// Провайдер контекста
export function CartProvider({ children }) {
  // Инициализируем состояние корзины из localStorage при загрузке
  const [cartItems, setCartItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Загружаем данные корзины из localStorage при старте
  useEffect(() => {
    // Проверка на клиентской стороне
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
      setIsLoaded(true);
    }
  }, []);

  // Сохраняем корзину в localStorage при изменениях
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  // Добавление товара в корзину
  const addToCart = (product) => {
    setCartItems(prevItems => {
      // Проверяем, есть ли уже этот товар в корзине
      const existingItemIndex = prevItems.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Если товар уже есть, обновляем его количество
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        // Если товара нет, добавляем новый
        return [...prevItems, { ...product, quantity: 1 }];
      }
    });
  };

  // Удаление товара из корзины
  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  // Обновление количества товара
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      // Если количество меньше или равно 0, удаляем товар
      removeFromCart(productId);
      return;
    }

    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
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