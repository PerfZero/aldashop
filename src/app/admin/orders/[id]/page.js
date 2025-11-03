'use client';

import { useState, useEffect, use, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../contexts/AuthContext';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import styles from './orderDetails.module.css';

const statusMap = {
  'awaiting': 'Новый',
  'accept': 'Подтвержден',
  'paid': 'Оплачен',
  'assembled': 'Собран',
  'sent': 'Отправлен',
  'received': 'Получен',
  'canceled': 'Отменен'
};

export default function OrderDetailsPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [isManager, setIsManager] = useState(null); // null = проверка, true = менеджер, false = склад
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [address, setAddress] = useState('');
  const [comment, setComment] = useState('');
  const [clientFirstName, setClientFirstName] = useState('');
  const [clientLastName, setClientLastName] = useState('');
  const [clientPatronymic, setClientPatronymic] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [inn, setInn] = useState('');
  const [isProcessed, setIsProcessed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [productQuantities, setProductQuantities] = useState({});
  const [productsToRemove, setProductsToRemove] = useState([]);
  const [newProductArticle, setNewProductArticle] = useState('');
  const [productsToAdd, setProductsToAdd] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return price.toLocaleString('ru-RU');
  };

  const searchProductByArticle = async (article) => {
    if (!article.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('https://aldalinde.ru/api/admin_backend/manager/products/search-by-article', {
        method: 'POST',
        headers,
        body: JSON.stringify({ article: article.trim() }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          setSearchResults([]);
          return;
        } else {
          const errorData = await response.json();
          console.error('Ошибка поиска товара:', errorData);
          throw new Error(errorData.error || errorData.details || 'Ошибка при поиске товара');
        }
      }

      const data = await response.json();
      setSearchResults(Array.isArray(data) ? data : []);
    } catch (err) {
      setSearchResults([]);
      console.error('Ошибка поиска товара:', err);
    } finally {
      setSearching(false);
    }
  };

  const searchTimeoutRef = useRef(null);

  const handleArticleChange = (value) => {
    setNewProductArticle(value);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (value.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        searchProductByArticle(value);
      }, 500);
    } else {
      setSearchResults([]);
    }
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const addProductToOrder = (product) => {
    const productId = product.id;
    if (productId && !productsToAdd.find(p => p.id === productId)) {
      setProductsToAdd([...productsToAdd, {
        id: productId,
        quantity: 1,
        full_name: product.title || product.full_name || '',
        generated_article: product.generated_article || product.article || '',
        article: product.article || product.generated_article || '',
        photos: product.photos || [],
        color: product.color || null,
        sizes: product.sizes || null,
        material: product.material || null
      }]);
      setProductQuantities({
        ...productQuantities,
        [productId]: 1
      });
      setNewProductArticle('');
      setSearchResults([]);
    }
  };

  const checkUserRole = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Пробуем запрос к API менеджера
      const response = await fetch(`https://aldalinde.ru/api/admin_backend/manager/order/${id}`, {
        headers
      });

      if (response.ok || response.status === 400) {
        setIsManager(true);
        return true;
      } else if (response.status === 403) {
        setIsManager(false);
        return false;
      } else {
        setIsManager(false);
        return false;
      }
    } catch (err) {
      setIsManager(false);
      return false;
    }
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
      return;
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const initialize = async () => {
      if (!authLoading && isAuthenticated) {
        if (isManager === null) {
          await checkUserRole();
        }
        if (isManager !== null) {
          await fetchOrder();
        }
      }
    };
    initialize();
  }, [id, isManager, authLoading, isAuthenticated]);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const apiUrl = isManager 
        ? `https://aldalinde.ru/api/admin_backend/manager/order/${id}`
        : `https://aldalinde.ru/api/admin_backend/storage/order/${id}`;

      const response = await fetch(apiUrl, {
        headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при загрузке заказа');
      }

      const data = await response.json();
      setOrder(data);
      setStatus(data.status || '');
      setAddress(data.address || '');
      setComment(data.comment || '');
      
      const initialQuantities = {};
      if (data.products && Array.isArray(data.products)) {
        data.products.forEach(product => {
          initialQuantities[product.id] = product.quantity || 1;
        });
      }
      setProductQuantities(initialQuantities);
      
      if (isManager) {
        // Поля только для менеджера
        setClientFirstName(data.client_first_name || '');
        setClientLastName(data.client_last_name || '');
        setClientPatronymic(data.client_patronymic || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setInn(data.inn || '');
        setIsProcessed(data.is_processed || false);
        if (data.order_date) {
          setDeliveryDate(formatDate(data.order_date));
        }
      } else {
        // Для склада используем received_date если есть
        if (data.received_date) {
          setDeliveryDate(formatDate(data.received_date));
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSaveStatus = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    
    try {
      const updateData = {};
      
      if (status && status !== order.status) {
        updateData.status = status;
      }
      
      if (comment !== undefined && comment !== (order.comment || '')) {
        updateData.comment = comment;
      }

      if (isManager) {
        // Поля только для менеджера
        if (address !== undefined && address !== (order.address || '')) {
          updateData.address = typeof address === 'string' ? address : address;
        }

        order.products?.forEach(product => {
          const currentQty = productQuantities[product.id];
          if (currentQty !== undefined && currentQty !== product.quantity) {
            const originalQty = product.quantity || 1;
            const newQty = currentQty;
            
            if (newQty < originalQty) {
              if (!updateData.remove_products) {
                updateData.remove_products = [];
              }
              updateData.remove_products.push({
                id: parseInt(product.id),
                quantity: parseInt(originalQty - newQty)
              });
            } else if (newQty > originalQty) {
              if (!updateData.add_products) {
                updateData.add_products = [];
              }
              updateData.add_products.push({
                id: parseInt(product.id),
                quantity: parseInt(newQty - originalQty)
              });
            }
          }
        });

        if (productsToRemove.length > 0) {
          if (!updateData.remove_products) {
            updateData.remove_products = [];
          }
          productsToRemove.forEach(item => {
            const productId = typeof item === 'object' ? item.id : item;
            const quantity = typeof item === 'object' ? item.quantity : (productQuantities[productId] || 1);
            updateData.remove_products.push({
              id: parseInt(productId),
              quantity: parseInt(quantity)
            });
          });
        }

        if (productsToAdd.length > 0) {
          if (!updateData.add_products) {
            updateData.add_products = [];
          }
          productsToAdd.forEach(product => {
            updateData.add_products.push({
              id: parseInt(product.id),
              quantity: parseInt(product.quantity || 1)
            });
          });
        }

        if (clientFirstName !== undefined && clientFirstName !== (order.client_first_name || '')) {
          updateData.client_first_name = clientFirstName;
        }

        if (clientLastName !== undefined && clientLastName !== (order.client_last_name || '')) {
          updateData.client_last_name = clientLastName;
        }

        if (clientPatronymic !== undefined && clientPatronymic !== (order.client_patronymic || '')) {
          updateData.client_patronymic = clientPatronymic;
        }

        if (phone !== undefined && phone !== (order.phone || '')) {
          updateData.phone = phone;
        }

        if (email !== undefined && email !== (order.email || '')) {
          updateData.email = email;
        }

        if (inn !== undefined && inn !== (order.inn || '')) {
          updateData.inn = inn;
        }

        if (isProcessed !== undefined && isProcessed !== (order.is_processed || false)) {
          updateData.is_processed = isProcessed;
        }
      }

      if (Object.keys(updateData).length === 0) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        return;
      }

      const token = localStorage.getItem('accessToken');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const apiUrl = isManager 
        ? `https://aldalinde.ru/api/admin_backend/manager/order/${id}/update`
        : `https://aldalinde.ru/api/admin_backend/storage/order/${id}/update`;

      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при обновлении заказа');
      }

      const data = await response.json();
      setSaveSuccess(true);
      
      if (data.order) {
        setOrder(data.order);
        setStatus(data.order.status || '');
        setAddress(data.order.address || '');
        setComment(data.order.comment || '');
        
        if (isManager) {
          setClientFirstName(data.order.client_first_name || '');
          setClientLastName(data.order.client_last_name || '');
          setClientPatronymic(data.order.client_patronymic || '');
          setPhone(data.order.phone || '');
          setEmail(data.order.email || '');
          setInn(data.order.inn || '');
          setIsProcessed(data.order.is_processed || false);
          setProductsToRemove([]);
          setProductsToAdd([]);
          setNewProductArticle('');
          const newQuantities = {};
          if (data.order.products && Array.isArray(data.order.products)) {
            data.order.products.forEach(product => {
              newQuantities[product.id] = product.quantity || 1;
            });
          }
          setProductQuantities(newQuantities);
        }
      } else {
        // Если API склада возвращает заказ напрямую
        setOrder(data);
        setStatus(data.status || '');
        setComment(data.comment || '');
      }
      
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !isAuthenticated || isManager === null || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <p style={{ color: 'red' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <p>Заказ не найден</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.orderHeader}>
          <Link href="/admin/orders" className={styles.backButton}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Вернуться
          </Link>
          <h1 className={styles.title}>Заказ №{order.order_number || id}</h1>
          <div className={styles.orderTime}>Прошло: {order.processing_time || '00 ч 00 м'}</div>
        </div>
        
        <div className={styles.orderDetails}>
          <div className={styles.formGroup}>
            <label>Адрес доставки/пункта самовывоза:</label>
            <div className={styles.inputWithIcon}>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Введите адрес"
                className={styles.formInput}
              />
              
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Дата доставки/самовывоза:</label>
            <div className={styles.inputWithIcon}>
              <input
                type="text"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className={styles.formInput}
              />
              <button className={styles.editButton}>
              <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M19.09 14.9412V19.3812C19.0898 20.0094 18.8401 20.6118 18.3959 21.0561C17.9516 21.5003 17.3492 21.75 16.721 21.7502H5.12002C4.80777 21.7501 4.49863 21.6883 4.21035 21.5683C3.92208 21.4483 3.66035 21.2726 3.44021 21.0511C3.22007 20.8297 3.04586 20.5669 2.92758 20.2779C2.80931 19.989 2.74931 19.6795 2.75102 19.3672V7.77922C2.74916 7.46747 2.80919 7.15845 2.92764 6.87007C3.04608 6.58169 3.22059 6.31968 3.44103 6.09924C3.66148 5.87879 3.92348 5.70429 4.21186 5.58584C4.50025 5.4674 4.80927 5.40736 5.12102 5.40922H9.56002" stroke="#C1A286" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M19.09 9.49521L15.005 5.40921M6.83496 16.3032V14.1382C6.83696 13.7812 6.97896 13.4382 7.22996 13.1852L16.762 3.65321C16.8884 3.52532 17.039 3.42378 17.205 3.35449C17.371 3.28519 17.5491 3.24951 17.729 3.24951C17.9088 3.24951 18.0869 3.28519 18.2529 3.35449C18.4189 3.42378 18.5695 3.52532 18.696 3.65321L20.847 5.80421C20.9749 5.93069 21.0764 6.08128 21.1457 6.24727C21.215 6.41326 21.2507 6.59134 21.2507 6.77121C21.2507 6.95108 21.215 7.12917 21.1457 7.29515C21.0764 7.46114 20.9749 7.61173 20.847 7.73821L11.315 17.2702C11.0615 17.5219 10.7192 17.6638 10.362 17.6652H8.19696C8.01803 17.6655 7.8408 17.6304 7.67544 17.5621C7.51007 17.4937 7.35982 17.3934 7.2333 17.2669C7.10677 17.1404 7.00646 16.9901 6.9381 16.8247C6.86975 16.6594 6.8347 16.4821 6.83496 16.3032Z" stroke="#C1A286" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</svg>
              </button>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Статус заказа:</label>
            <div className={styles.inputWithIcon}>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={styles.formInput}
                disabled={!isManager && order.can_change_status === false}
              >
                {order.available_statuses && order.available_statuses.length > 0 ? (
                  order.available_statuses.map(statusVal => (
                    <option key={statusVal} value={statusVal}>
                      {statusMap[statusVal] || statusVal}
                    </option>
                  ))
                ) : (
                  Object.entries(statusMap).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))
                )}
              </select>
              <button className={styles.editButton}>
              <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M19.09 14.9412V19.3812C19.0898 20.0094 18.8401 20.6118 18.3959 21.0561C17.9516 21.5003 17.3492 21.75 16.721 21.7502H5.12002C4.80777 21.7501 4.49863 21.6883 4.21035 21.5683C3.92208 21.4483 3.66035 21.2726 3.44021 21.0511C3.22007 20.8297 3.04586 20.5669 2.92758 20.2779C2.80931 19.989 2.74931 19.6795 2.75102 19.3672V7.77922C2.74916 7.46747 2.80919 7.15845 2.92764 6.87007C3.04608 6.58169 3.22059 6.31968 3.44103 6.09924C3.66148 5.87879 3.92348 5.70429 4.21186 5.58584C4.50025 5.4674 4.80927 5.40736 5.12102 5.40922H9.56002" stroke="#C1A286" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M19.09 9.49521L15.005 5.40921M6.83496 16.3032V14.1382C6.83696 13.7812 6.97896 13.4382 7.22996 13.1852L16.762 3.65321C16.8884 3.52532 17.039 3.42378 17.205 3.35449C17.371 3.28519 17.5491 3.24951 17.729 3.24951C17.9088 3.24951 18.0869 3.28519 18.2529 3.35449C18.4189 3.42378 18.5695 3.52532 18.696 3.65321L20.847 5.80421C20.9749 5.93069 21.0764 6.08128 21.1457 6.24727C21.215 6.41326 21.2507 6.59134 21.2507 6.77121C21.2507 6.95108 21.215 7.12917 21.1457 7.29515C21.0764 7.46114 20.9749 7.61173 20.847 7.73821L11.315 17.2702C11.0615 17.5219 10.7192 17.6638 10.362 17.6652H8.19696C8.01803 17.6655 7.8408 17.6304 7.67544 17.5621C7.51007 17.4937 7.35982 17.3934 7.2333 17.2669C7.10677 17.1404 7.00646 16.9901 6.9381 16.8247C6.86975 16.6594 6.8347 16.4821 6.83496 16.3032Z" stroke="#C1A286" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</svg>
              </button>
            </div>
          </div>
          
          {isManager && (
            <>
              <div className={styles.formGroup}>
                <label>Фамилия клиента:</label>
                <div className={styles.inputWithIcon}>
                  <input
                    type="text"
                    value={clientLastName}
                    onChange={(e) => setClientLastName(e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Имя клиента:</label>
                <div className={styles.inputWithIcon}>
                  <input
                    type="text"
                    value={clientFirstName}
                    onChange={(e) => setClientFirstName(e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Отчество клиента:</label>
                <div className={styles.inputWithIcon}>
                  <input
                    type="text"
                    value={clientPatronymic}
                    onChange={(e) => setClientPatronymic(e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Телефон:</label>
                <div className={styles.inputWithIcon}>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Email:</label>
                <div className={styles.inputWithIcon}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>ИНН организации:</label>
                <div className={styles.inputWithIcon}>
                  <input
                    type="text"
                    value={inn}
                    onChange={(e) => setInn(e.target.value)}
                    className={styles.formInput}
                  />
                </div>
              </div>
              
              <div className={styles.formGroup}>
                <label>Обработан менеджером:</label>
                <div className={styles.inputWithIcon}>
                  <input
                    type="checkbox"
                    checked={isProcessed}
                    onChange={(e) => setIsProcessed(e.target.checked)}
                    style={{ width: 'auto', height: 'auto' }}
                  />
                </div>
              </div>
            </>
          )}
          
          <div className={styles.formGroup}>
            <label>Комментарий (любое слово из комментария):</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Введите комментарий"
              className={styles.commentInput}
              rows={3}
            />
          </div>
          
          {order.address && (
            <div className={styles.formGroup}>
              <label>Адрес доставки на карте:</label>
              <YMaps 
                query={{
                  apikey: 'aa9feae8-022d-44d2-acb1-8cc0198f451d',
                  lang: 'ru_RU',
                  load: 'package.full'
                }}
              >
                <Map
                  state={{
                    center: [43.585472, 39.723098],
                    zoom: 15
                  }}
                  width="100%"
                  height="250px"
                  options={{
                    restrictMapArea: [[41.185096, 19.616318], [81.858710, 180.000000]]
                  }}
                >
                  <Placemark
                    geometry={[43.585472, 39.723098]}
                    options={{
                      preset: 'islands#redDotIcon'
                    }}
                    properties={{
                      balloonContent: order.address
                    }}
                  />
                </Map>
              </YMaps>
            </div>
          )}
          
        
  
        </div>
        
        {isManager && (
          <div className={styles.addProductSection}>
              <h3 className={styles.addProductTitle}>Добавить товар</h3>
              <div className={styles.addProductInputWrapper}>
                <div className={styles.addProductInputRow}>
                  <input
                    type="text"
                    value={newProductArticle}
                    onChange={(e) => handleArticleChange(e.target.value)}
                    placeholder="Введите артикул товара"
                    className={styles.addProductInput}
                  />
                  <button
                    onClick={async () => {
                      if (searchResults.length > 0 && searchResults[0]) {
                        addProductToOrder(searchResults[0]);
                      } else if (newProductArticle.trim()) {
                        try {
                          setSearching(true);
                          const token = localStorage.getItem('accessToken');
                          const headers = {
                            'Content-Type': 'application/json',
                          };
                          if (token) {
                            headers['Authorization'] = `Bearer ${token}`;
                          }
                          
                          const response = await fetch('https://aldalinde.ru/api/admin_backend/manager/products/search-by-article', {
                            method: 'POST',
                            headers,
                            body: JSON.stringify({ article: newProductArticle.trim() }),
                          });
                          
                          if (response.ok) {
                            const data = await response.json();
                            if (Array.isArray(data) && data.length > 0) {
                              addProductToOrder(data[0]);
                            } else {
                              alert('Товар не найден');
                            }
                          } else {
                            alert('Ошибка при поиске товара');
                          }
                        } catch (err) {
                          alert('Ошибка при поиске товара');
                        } finally {
                          setSearching(false);
                        }
                      }
                    }}
                    className={styles.addProductButton}
                    disabled={searching || !newProductArticle.trim()}
                  >
                    Добавить
                  </button>
                  {searching && (
                    <span className={styles.searchingText}>Поиск...</span>
                  )}
                </div>
                
                {searchResults.length > 0 && (
                  <div className={styles.searchResults}>
                    {searchResults.map((product, index) => (
                      <div
                        key={product.id || index}
                        onClick={() => addProductToOrder(product)}
                        className={styles.searchResultItem}
                      >
                        <div className={styles.searchResultContent}>
                          <div className={styles.searchResultTitle}>
                            {product.title || product.full_name || 'Товар'}
                          </div>
                          <div className={styles.searchResultSku}>
                            Артикул: {product.generated_article || product.article || ''}
                          </div>
                          {product.price && (
                            <div className={styles.searchResultPrice}>
                              {formatPrice(product.price)} ₽
                            </div>
                          )}
                          {product.color && (
                            <div className={styles.searchResultColor}>
                              <span 
                                className={styles.searchResultColorCircle}
                                style={{
                                  background: `#${product.color.code_hex || 'cfc2b0'}`,
                                  border: '1px solid #bdbdbd'
                                }}
                              ></span>
                              <span className={styles.searchResultColorText}>{product.color.title || product.color.name || ''}</span>
                            </div>
                          )}
                          {product.sizes && (
                            <div className={styles.searchResultSizes}>
                              {product.sizes.width && `${product.sizes.width}×`}
                              {product.sizes.height && `${product.sizes.height}×`}
                              {product.sizes.depth && product.sizes.depth}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addProductToOrder(product);
                          }}
                          className={styles.searchResultAddButton}
                        >
                          Добавить
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {productsToAdd.length > 0 && (
                <div className={styles.productsToAddList}>
                  <p className={styles.productsToAddTitle}>Товары для добавления:</p>
                  {productsToAdd.map((product, index) => (
                    <div key={index} className={styles.productsToAddItem}>
                      <span>{product.full_name || product.title || product.article || 'Товар'} {product.generated_article || product.article ? `(Артикул: ${product.generated_article || product.article})` : ''} - Количество: </span>
                      <div className={styles.quantityControlsInline}>
                        <div className={styles.quantityButtons}>
                          <button 
                            type="button"
                            className={styles.minusButton} 
                            onClick={() => {
                              const updatedProducts = [...productsToAdd];
                              if (updatedProducts[index].quantity > 1) {
                                updatedProducts[index].quantity -= 1;
                                setProductsToAdd(updatedProducts);
                              }
                            }}
                            disabled={product.quantity <= 1}
                          >
                            <svg width="10" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 1H1" stroke="#C1AF86" strokeWidth="1" strokeLinecap="round"/>
                            </svg>
                          </button>
                          <span className={styles.quantity}>{product.quantity || 1}</span>
                          <button 
                            type="button"
                            className={styles.plusButton} 
                            onClick={() => {
                              const updatedProducts = [...productsToAdd];
                              updatedProducts[index].quantity = (updatedProducts[index].quantity || 1) + 1;
                              setProductsToAdd(updatedProducts);
                            }}
                          >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 1V9M9 5H1" stroke="#C1AF86" strokeWidth="1" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => setProductsToAdd(productsToAdd.filter((_, i) => i !== index))}
                        className={styles.productsToAddItemRemove}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        
        <h2 className={styles.sectionTitle}>Позиции заказа</h2>
          
          {order.products && order.products.length > 0 ? (
            order.products.map(product => {
              const isMarkedForRemoval = productsToRemove.some(item => {
                const itemId = typeof item === 'object' ? item.id : item;
                return itemId === product.id;
              });
              return (
                <div key={product.id} className={`${styles.productCard} ${styles.productCardFlex} ${isMarkedForRemoval ? styles.productCardRemoved : ''}`}>
                  <Link href={`/product/${product.id}`} className={styles.productCardLink}>
                    <div className={styles.productImage}>
                      <img 
                        src={
                          product.photos && product.photos.length > 0 
                            ? (product.photos[0].startsWith('http') 
                                ? product.photos[0] 
                                : `https://aldalinde.ru${product.photos[0]}`)
                            : '/placeholder.jpg'
                        } 
                        alt={product.full_name || 'Товар'} 
                      />
                    </div>
                    <div className={`${styles.productDetails} ${styles.productDetailsFlex}`}>
                      <div className={styles.productName}>{product.full_name || ''}</div>
                      <div className={styles.productSku}>Артикул: {product.generated_article || product.article || ''}</div>
                      <div className={styles.productRow}>
                        {product.color && (
                          <>
                            <span className={styles.colorCircle} style={{background: `#${product.color.code_hex || product.color.hex || 'cfc2b0'}`}}></span>
                            <span className={styles.productDivider}>|</span>
                            <span>{product.color.title || product.color.name || ''}</span>
                            {product.sizes && <span className={styles.productDivider}>|</span>}
                          </>
                        )}
                    
                        {product.sizes && (
                          <span className={styles.productSize}>
                            {product.sizes.width && `${product.sizes.width}×`}
                            {product.sizes.height && `${product.sizes.height}×`}
                            {product.sizes.depth && product.sizes.depth}
                            {!product.sizes.width && !product.sizes.height && !product.sizes.depth && 
                              Object.entries(product.sizes).map(([key, value]) => `${key}: ${value}`).join(', ')
                            }
                          </span>
                        )}
                      </div>
                      {isMarkedForRemoval && (
                        <div className={styles.removeWarning}>Товар будет удален при сохранении</div>
                      )}
                    </div>
                  </Link>
                  <div className={styles.productActions}>
                    {isManager ? (
                      <div className={styles.quantityControls}>
                        <div className={styles.quantityButtons}>
                          <button 
                            type="button"
                            className={styles.minusButton} 
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentQty = productQuantities[product.id] || product.quantity || 1;
                              if (currentQty > 1) {
                                setProductQuantities({
                                  ...productQuantities,
                                  [product.id]: currentQty - 1
                                });
                              }
                            }}
                            disabled={(productQuantities[product.id] || product.quantity || 1) <= 1}
                          >
                            <svg width="10" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 1H1" stroke="#C1AF86" strokeWidth="1" strokeLinecap="round"/>
                            </svg>
                          </button>
                          <span className={styles.quantity}>{productQuantities[product.id] !== undefined ? productQuantities[product.id] : (product.quantity || 1)}</span>
                          <button 
                            type="button"
                            className={styles.plusButton} 
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentQty = productQuantities[product.id] || product.quantity || 1;
                              setProductQuantities({
                                ...productQuantities,
                                [product.id]: currentQty + 1
                              });
                            }}
                          >
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M5 1V9M9 5H1" stroke="#C1AF86" strokeWidth="1" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className={`${styles.productQuantity} ${styles.productQuantityRight}`}>{product.quantity || 1} шт.</div>
                    )}
                    {isManager && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentQty = productQuantities[product.id] || product.quantity || 1;
                          const removeItem = { id: product.id, quantity: currentQty };
                          if (isMarkedForRemoval) {
                            setProductsToRemove(productsToRemove.filter(item => {
                              const itemId = typeof item === 'object' ? item.id : item;
                              return itemId !== product.id;
                            }));
                          } else {
                            setProductsToRemove([...productsToRemove, removeItem]);
                          }
                        }}
                        className={`${styles.removeProductButton} ${isMarkedForRemoval ? styles.removeProductButtonRestore : ''}`}
                      >
                        {isMarkedForRemoval ? 'Отменить удаление' : 'Удалить'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p>Товары не найдены</p>
          )}
          
            <div className={styles.saveActions}>
              {saveError && (
                <p className={styles.saveError}>{saveError}</p>
              )}
              {saveSuccess && (
                <p className={styles.saveSuccess}>Заказ успешно обновлен</p>
              )}
              <button 
                className={styles.saveButton} 
                onClick={handleSaveStatus}
                disabled={saving}
              >
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
            </div>
          
      </div>
      
    </div>
  );
} 