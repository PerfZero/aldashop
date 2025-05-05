'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './orders.module.css';

// Имитация данных заказов
const MOCK_ORDERS = [
  {
    id: '32232',
    customer: 'Иванов Иван Иванович',
    itemsCount: 2,
    total: '50 000 руб.',
    date: '22.02.2023',
    status: 'Получен',
    timeElapsed: '37ч 10м',
    inn: '7701234567',
    managerProcessed: true,
    cancelled: false
  },
  {
    id: '23223',
    customer: 'Иванов Иван Иванович',
    itemsCount: 1,
    total: '15 000 руб.',
    date: '02.12.2023',
    status: 'Получен',
    timeElapsed: '37ч 10м',
    inn: '7707654321',
    managerProcessed: false,
    cancelled: true
  },
  {
    id: '33232',
    customer: 'Иванов Иван Иванович',
    itemsCount: 2,
    total: '50 000 руб.',
    date: '22.02.2023',
    status: 'Получен',
    timeElapsed: '37ч 10м',
    inn: '7701122334',
    managerProcessed: true,
    cancelled: false
  }
];

export default function OrdersPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [comment, setComment] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusOptions = [
    "Новый",
    "Подтвержден",
    "Оплачен",
    "Отправлен",
    "Доставлен",
    "Получен",
    "Отменен"
  ];
  const [filteredOrders, setFilteredOrders] = useState(MOCK_ORDERS);
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [address, setAddress] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [inn, setInn] = useState('');
  const [managerProcessed, setManagerProcessed] = useState('');
  const [orderSum, setOrderSum] = useState('');
  const [showCancelled, setShowCancelled] = useState(false);
  const [showManagerProcessed, setShowManagerProcessed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    let filtered = MOCK_ORDERS.filter(order => {
      const matchesNumber = orderNumber === '' || order.id.includes(orderNumber);
      const matchesStatus = orderStatus === '' || order.status === orderStatus;
      const matchesDate = deliveryDate === '' || order.date === deliveryDate.split('-').reverse().join('.');
      // В MOCK_ORDERS нет комментариев, поэтому фильтрация по комментарию не работает
      return matchesNumber && matchesStatus && matchesDate;
    });
    setFilteredOrders(filtered);
  };

  const handleReset = () => {
    setOrderNumber('');
    setOrderStatus('');
    setDeliveryDate('');
    setComment('');
    setFilteredOrders(MOCK_ORDERS);
  };

  return (
    <div className={styles.container}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 className={styles.title}>Заказы</h1>
        <div>
         
          <button
            type="button"
            className={styles.primaryButtons}
            style={{ marginLeft: 16 }}
            onClick={() => setShowExtraFields((prev) => !prev)}
          >
            {showExtraFields ? 'Скрыть дополнительные поля' : 'Добавить фильтры'}
          </button>
        </div>
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
                placeholder="Введите номер заказа"
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
                      value={orderStatus}
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
                    {statusOptions.map((status, idx) => (
                      <div
                        key={idx}
                        className={styles.selectOption}
                        onClick={() => {
                          setOrderStatus(status);
                          setIsStatusDropdownOpen(false);
                        }}
                      >
                        {status}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="deliveryDate">Дата доставки/самовывоза:</label>
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
          
          {showExtraFields && (
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
                  <label htmlFor="orderDate">Дата заказа:</label>
                  <input
                    type="date"
                    id="orderDate"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="address">Адрес доставки/пункта самовывоза:</label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Введите адрес"
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
             
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="orderSum">Сумма заказа:</label>
                  <input
                    type="text"
                    id="orderSum"
                    value={orderSum}
                    onChange={(e) => setOrderSum(e.target.value)}
                    placeholder="Введите сумму заказа"
                  />
                </div>
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
          )}
          
          <div className={styles.formActions}>
            <button type="submit" className={styles.primaryButton}>Найти</button>
            <button type="button" className={styles.secondaryButton} onClick={handleReset}>Отменить</button>
          </div>
        </form>
        
        <div className={styles.ordersTableContainer}>
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
              <th>ИНН организации</th>
              <th>Обработан менеджером</th>
              <th>Отменён</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>
                  <Link href={`/admin/orders/${order.id}`}>
                    {order.id}
                  </Link>
                </td>
                <td>{order.customer}</td>
                <td>{order.itemsCount}</td>
                <td>{order.total}</td>
                <td>{order.date}</td>
                <td>
                  <span className={styles.statusLabel}>
                    {order.status}
                  </span>
                </td>
                <td>{order.timeElapsed}</td>
                <td>{order.inn}</td>
                <td>
                  <input type="checkbox" checked={order.managerProcessed}  />
                </td>
                <td>
                  <input type="checkbox" checked={order.cancelled}  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
} 