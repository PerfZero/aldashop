'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../contexts/AuthContext';
import styles from './orders.module.css';

export const dynamic = 'force-dynamic';

const statusMap = {
  'awaiting': 'Новый',
  'accept': 'Подтвержден',
  'paid': 'Оплачен',
  'assembled': 'Собран',
  'sent': 'Отправлен',
  'received': 'Получен',
  'canceled': 'Отменен'
};

const statusOptions = [
  { value: 'awaiting', label: 'Новый' },
  { value: 'accept', label: 'Подтвержден' },
  { value: 'paid', label: 'Оплачен' },
  { value: 'assembled', label: 'Собран' },
  { value: 'sent', label: 'Отправлен' },
  { value: 'received', label: 'Получен' },
  { value: 'canceled', label: 'Отменен' }
];

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isManager, setIsManager] = useState(null); // null = проверка, true = менеджер, false = склад
  const [orderNumber, setOrderNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [orderDateFrom, setOrderDateFrom] = useState('');
  const [orderDateTo, setOrderDateTo] = useState('');
  const [comment, setComment] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [inn, setInn] = useState('');
  const [sumFrom, setSumFrom] = useState('');
  const [sumTo, setSumTo] = useState('');
  const [showCancelled, setShowCancelled] = useState(false);
  const [showManagerProcessed, setShowManagerProcessed] = useState(false);

  const checkUserRole = useCallback(async () => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      // Пробуем запрос к API менеджера
      const response = await fetch('https://aldalinde.ru/api/admin_backend/manager/orders?page=1&page_size=1', {
        headers
      });

      if (response.ok || response.status === 400) {
        // 200 или 400 означает, что у пользователя есть доступ к API менеджера
        setIsManager(true);
        return true;
      } else if (response.status === 403) {
        // 403 означает, что нет доступа к API менеджера, значит это склад
        setIsManager(false);
        return false;
      } else {
        // Для других ошибок пробуем API склада
        setIsManager(false);
        return false;
      }
    } catch (err) {
      // При ошибке предполагаем, что это склад
      setIsManager(false);
      return false;
    }
  }, []);

  const fetchOrders = useCallback(async (pageNum = 1) => {
    if (typeof window === 'undefined') return;
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

      if (isManager) {
        // Логика для менеджера
        const params = new URLSearchParams({
          page: pageNum.toString(),
          page_size: '20'
        });

        if (orderNumber) params.append('order_id', orderNumber);
        if (orderStatus) params.append('status', orderStatus);
        if (phone) params.append('phone', phone);
        if (email) params.append('email', email);
        if (orderDate) params.append('order_date', orderDate);
        if (orderDateFrom) params.append('order_date_from', orderDateFrom);
        if (orderDateTo) params.append('order_date_to', orderDateTo);
        if (address) params.append('address', address);
        if (firstName) params.append('first_name', firstName);
        if (lastName) params.append('last_name', lastName);
        if (middleName) params.append('patronymic', middleName);
        if (inn) params.append('inn', inn);
        if (comment) params.append('comment', comment);
        if (sumFrom) params.append('sum_from', sumFrom);
        if (sumTo) params.append('sum_to', sumTo);
        if (showCancelled) params.append('is_canceled', 'true');
        if (showManagerProcessed) params.append('processed', 'true');

        const response = await fetch(`https://aldalinde.ru/api/admin_backend/manager/orders?${params.toString()}`, {
          headers
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка при загрузке заказов');
        }

        const data = await response.json();
        console.log('Orders data received (manager):', data);
        setOrders(data.results || []);
        setTotalPages(data.total_pages || 1);
        setPage(pageNum);
      } else {
        // Логика для склада
        const params = new URLSearchParams({
          page: pageNum.toString(),
          page_size: '20'
        });

        if (orderNumber) params.append('order_number', orderNumber);
        if (orderStatus) params.append('status', orderStatus);
        if (deliveryDate) params.append('delivery_date', deliveryDate);
        if (comment) params.append('comment', comment);

        const response = await fetch(`https://aldalinde.ru/api/admin_backend/storage/orders?${params.toString()}`, {
          headers
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка при загрузке заказов');
        }

        const data = await response.json();
        console.log('Orders data received (storage):', data);
        setOrders(data.results || []);
        setTotalPages(data.total_pages || 1);
        setPage(pageNum);
      }
    } catch (err) {
      setError(err.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [isManager, orderNumber, orderStatus, phone, email, orderDate, orderDateFrom, orderDateTo, address, firstName, lastName, middleName, inn, comment, sumFrom, sumTo, showCancelled, showManagerProcessed, deliveryDate]);

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
          await fetchOrders(1);
        }
      }
    };
    initialize();
  }, [isManager, authLoading, isAuthenticated, checkUserRole, fetchOrders]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchOrders(1);
  };

  const handleReset = () => {
    setOrderNumber('');
    setOrderStatus('');
    setDeliveryDate('');
    setOrderDate('');
    setOrderDateFrom('');
    setOrderDateTo('');
    setComment('');
    setPhone('');
    setEmail('');
    setAddress('');
    setFirstName('');
    setLastName('');
    setMiddleName('');
    setInn('');
    setSumFrom('');
    setSumTo('');
    setShowCancelled(false);
    setShowManagerProcessed(false);
    fetchOrders(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatSum = (sum) => {
    if (!sum) return '0 руб.';
    return `${sum.toLocaleString('ru-RU')} руб.`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  if (authLoading || !isAuthenticated || isManager === null) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Заказы</h1>
        <div className={styles.content}>
          <p>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={styles.title}>Заказы</h1>
      </div>
      
      <div className={styles.content}>
        <form className={styles.filterForm} onSubmit={handleSubmit}>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="orderNumber">Номер заказа:</label>
              <input
                type="text"
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder={isManager ? "Введите номер заказа" : "Введите номер заказа (#1234 или 1234)"}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="orderStatus">Статус заказа:</label>
              <div className={styles.customSelect}>
                <div
                  className={styles.selectHeader}
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                >
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      id="orderStatus"
                      value={statusOptions.find(s => s.value === orderStatus)?.label || ''}
                      placeholder="Выберите статус заказа"
                      readOnly
                      className={styles.pickupAddressField}
                    />
                    <span className={styles.floatingLabel}>
                      Статус заказа
                    </span>
                  </div>
                  <div className={styles.selectArrow}>
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L7 7L13 1" stroke="#C1AF86" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                {isStatusDropdownOpen && (
                  <div className={styles.selectOptions}>
                    {statusOptions.map((status) => (
                      <div
                        key={status.value}
                        className={styles.selectOption}
                        onClick={() => {
                          setOrderStatus(status.value);
                          setIsStatusDropdownOpen(false);
                        }}
                      >
                        {status.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {isManager ? (
            <>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Номер телефона клиента:</label>
                  <input
                    type="text"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Введите номер телефона"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Электронная почта клиента:</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Введите email"
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="orderDate">Дата заказа (точная):</label>
                  <input
                    type="date"
                    id="orderDate"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="orderDateFrom">Дата заказа (от):</label>
                  <input
                    type="date"
                    id="orderDateFrom"
                    value={orderDateFrom}
                    onChange={(e) => setOrderDateFrom(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="orderDateTo">Дата заказа (до):</label>
                  <input
                    type="date"
                    id="orderDateTo"
                    value={orderDateTo}
                    onChange={(e) => setOrderDateTo(e.target.value)}
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="address">Адрес доставки:</label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Введите адрес"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="comment">Комментарий (любое слово из комментария):</label>
                  <input
                    type="text"
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Введите комментарий"
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="firstName">Имя клиента:</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Введите имя"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="lastName">Фамилия клиента:</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Введите фамилию"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="middleName">Отчество клиента:</label>
                  <input
                    type="text"
                    id="middleName"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    placeholder="Введите отчество"
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="inn">ИНН организации:</label>
                  <input
                    type="text"
                    id="inn"
                    value={inn}
                    onChange={(e) => setInn(e.target.value)}
                    placeholder="Введите ИНН"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="sumFrom">Сумма заказа от:</label>
                  <input
                    type="number"
                    id="sumFrom"
                    value={sumFrom}
                    onChange={(e) => setSumFrom(e.target.value)}
                    placeholder="От"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="sumTo">Сумма заказа до:</label>
                  <input
                    type="number"
                    id="sumTo"
                    value={sumTo}
                    onChange={(e) => setSumTo(e.target.value)}
                    placeholder="До"
                  />
                </div>
              </div>
              
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="showCancelled">Отмененные заказы:</label>
                  <input
                    type="checkbox"
                    id="showCancelled"
                    checked={showCancelled}
                    onChange={(e) => setShowCancelled(e.target.checked)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="showManagerProcessed">Заказ обрабатывается менеджером:</label>
                  <input
                    type="checkbox"
                    id="showManagerProcessed"
                    checked={showManagerProcessed}
                    onChange={(e) => setShowManagerProcessed(e.target.checked)}
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="deliveryDate">Дата доставки:</label>
                  <input
                    type="date"
                    id="deliveryDate"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="comment">Комментарий (любое слово из комментария):</label>
                  <input
                    type="text"
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Введите комментарий"
                  />
                </div>
              </div>
            </>
          )}
          
          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton}>Найти</button>
            <button type="button" className={styles.secondaryButton} onClick={handleReset}>Отменить</button>
          </div>
        </form>
        
        <div className={styles.ordersTableContainer}>
          {loading && <p>Загрузка...</p>}
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {!loading && !error && orders.length === 0 && (
            <p>Заказы не найдены</p>
          )}
          {!loading && !error && orders.length > 0 && (
            <>
              <table className={styles.ordersTable}>
                <thead>
                  <tr>
                    <th>№</th>
                    <th>ФИО покупателя</th>
                    <th>Кол-во товаров</th>
                    <th>Сумма заказа</th>
                    <th>Дата заказа</th>
                    <th>Статус</th>
                    <th>Прошло</th>
                    {isManager && <th>ИНН организации</th>}
                    {isManager && <th>Обработан менеджером</th>}
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <Link href={`/admin/orders/${order.id}`}>
                          {order.order_number || order.id}
                        </Link>
                      </td>
                      <td>{order.client_full_name || ''}</td>
                      <td>{order.product_count || 0}</td>
                      <td>{formatSum(order.summ)}</td>
                      <td>{formatDate(order.order_date)}</td>
                      <td>
                        <span className={styles.statusLabel}>
                          {order.status_display || statusMap[order.status] || order.status}
                        </span>
                      </td>
                      <td>{formatTime(order.processing_time)}</td>
                      {isManager && <td>{order.inn || ''}</td>}
                      {isManager && (
                        <td>
                          <input type="checkbox" checked={order.is_processed || false} readOnly />
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalPages > 1 && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                  <button 
                    onClick={() => fetchOrders(page - 1)} 
                    disabled={page <= 1}
                  >
                    Назад
                  </button>
                  <span>Страница {page} из {totalPages}</span>
                  <button 
                    onClick={() => fetchOrders(page + 1)} 
                    disabled={page >= totalPages}
                  >
                    Вперед
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 