'use client';

import { useState } from 'react';
import Link from 'next/link';
import YandexMap from '../../../../components/YandexMap';
import styles from './orderDetails.module.css';

// Имитация данных заказа
const getMockOrderData = (id) => {
  return {
    id: id,
    status: 'Оплачен',
    deliveryDate: '23.09.2025',
    address: '',
    customer: 'Иванов Иван Иванович',
    phone: '+7 (999) 123-45-67',
    email: 'ivanov@example.com',
    total: '50 000 руб.',
    items: [
      {
        id: 1,
        name: 'Диван-кровать Скаген бежевого цвета',
        sku: 'IMR-1798647',
        color: 'Велюр',
        size: '235x90x135 см',
        price: '25 000 ₽',
        quantity: 1,
        image: '/products/sofa.jpg'
      },
      {
        id: 2,
        name: 'Диван-кровать Скаген бежевого цвета',
        sku: 'IMR-1798647',
        color: 'Велюр',
        size: '235x90x135 см',
        price: '25 000 ₽',
        quantity: 1,
        image: '/products/sofa.jpg'
      }
    ],
    comment: ''
  };
};

export default function OrderDetailsPage({ params }) {
  const { id } = params;
  const order = getMockOrderData(id);
  
  const [status, setStatus] = useState(order.status);
  const [deliveryDate, setDeliveryDate] = useState(order.deliveryDate);
  const [address, setAddress] = useState(order.address);
  const [comment, setComment] = useState(order.comment);
  
  const handleSaveStatus = () => {
    // Логика сохранения статуса заказа
    alert('Статус заказа обновлен');
  };
  
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
          <h1 className={styles.title}>Заказ №{id}</h1>
          <div className={styles.orderTime}>Прошло: 00 ч 00 м</div>
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
              >
                <option value="Новый">Новый</option>
                <option value="Подтвержден">Подтвержден</option>
                <option value="Оплачен">Оплачен</option>
                <option value="Отправлен">Отправлен</option>
                <option value="Доставлен">Доставлен</option>
                <option value="Получен">Получен</option>
                <option value="Отменен">Отменен</option>
              </select>
              <button className={styles.editButton}>
              <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M19.09 14.9412V19.3812C19.0898 20.0094 18.8401 20.6118 18.3959 21.0561C17.9516 21.5003 17.3492 21.75 16.721 21.7502H5.12002C4.80777 21.7501 4.49863 21.6883 4.21035 21.5683C3.92208 21.4483 3.66035 21.2726 3.44021 21.0511C3.22007 20.8297 3.04586 20.5669 2.92758 20.2779C2.80931 19.989 2.74931 19.6795 2.75102 19.3672V7.77922C2.74916 7.46747 2.80919 7.15845 2.92764 6.87007C3.04608 6.58169 3.22059 6.31968 3.44103 6.09924C3.66148 5.87879 3.92348 5.70429 4.21186 5.58584C4.50025 5.4674 4.80927 5.40736 5.12102 5.40922H9.56002" stroke="#C1A286" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M19.09 9.49521L15.005 5.40921M6.83496 16.3032V14.1382C6.83696 13.7812 6.97896 13.4382 7.22996 13.1852L16.762 3.65321C16.8884 3.52532 17.039 3.42378 17.205 3.35449C17.371 3.28519 17.5491 3.24951 17.729 3.24951C17.9088 3.24951 18.0869 3.28519 18.2529 3.35449C18.4189 3.42378 18.5695 3.52532 18.696 3.65321L20.847 5.80421C20.9749 5.93069 21.0764 6.08128 21.1457 6.24727C21.215 6.41326 21.2507 6.59134 21.2507 6.77121C21.2507 6.95108 21.215 7.12917 21.1457 7.29515C21.0764 7.46114 20.9749 7.61173 20.847 7.73821L11.315 17.2702C11.0615 17.5219 10.7192 17.6638 10.362 17.6652H8.19696C8.01803 17.6655 7.8408 17.6304 7.67544 17.5621C7.51007 17.4937 7.35982 17.3934 7.2333 17.2669C7.10677 17.1404 7.00646 16.9901 6.9381 16.8247C6.86975 16.6594 6.8347 16.4821 6.83496 16.3032Z" stroke="#C1A286" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</svg>
              </button>
            </div>
          </div>
          
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
          
          <div className={styles.formGroup}>
            <label>Адрес доставки на карте:</label>
            <YandexMap
              onLocationSelect={(locationData) => {
                setAddress(locationData.address);
                console.log('Выбран адрес:', locationData);
              }}
              initialCenter={[43.585472, 39.723098]}
              initialZoom={12}
              height="250px"
              showGeolocation={true}
              showSearch={true}
            />
          </div>
          
        
  
        </div>
        <h2 className={styles.sectionTitle}>Позиции заказа</h2>
          
          {order.items.map(item => (
            <div key={item.id} className={styles.productCard}>
              <div className={styles.productImage}>
                <img src={item.image || '/placeholder.jpg'} alt={item.name} />
              </div>
              <div className={styles.productDetails}>
                <div className={styles.productName}>{item.name}</div>
                <div className={styles.productSku}>Артикул: {item.sku}</div>
                <div className={styles.productRow}>
                  <span className={styles.colorCircle} style={{background: '#cfc2b0'}}></span>
                  <span className={styles.productDivider}>|</span>

                  <span className={styles.productMaterial}>Велюр</span>
                  <span className={styles.productDivider}>|</span>
                  <span className={styles.productSize}>{item.size}</span>
                </div>
                <div className={styles.productPrice}>{item.price.replace(' ₽','').replace('руб.','').replace(',','.')}&nbsp;<span className={styles.productCurrency}>₽</span></div>
              </div>
            </div>
          ))}
            <button className={styles.saveButton} onClick={handleSaveStatus}>
            Сохранить статус
          </button>
          
      </div>
      
    </div>
  );
} 