'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useFavourites } from '../../contexts/FavouritesContext';
import ProductCard from '../../components/ProductCard';

const menuItems = [
  {
    id: 'account',
    label: 'Аккаунт',
    icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7.5625 0.0187499C6.55625 0.14375 5.71563 0.553125 5.01563 1.2625C4.39375 1.89062 4.0375 2.55937 3.85313 3.4375C3.77812 3.80625 3.77812 4.63125 3.85313 5C4.0375 5.87812 4.39688 6.55 5.01563 7.175C5.64375 7.80937 6.33125 8.18125 7.21875 8.36562C7.58438 8.44063 8.40625 8.44063 8.7875 8.36562C9.63125 8.19687 10.3313 7.82187 10.9563 7.20312C11.5875 6.58125 11.9625 5.8875 12.1469 5C12.2219 4.63125 12.2219 3.80625 12.1469 3.4375C12.025 2.85937 11.8031 2.325 11.4844 1.84375C11.2875 1.54687 10.6781 0.934375 10.3875 0.74375C9.88438 0.409375 9.34063 0.18125 8.80625 0.0781249C8.55313 0.0281249 7.78125 -0.00937513 7.5625 0.0187499ZM8.75 1.025C9.36875 1.1875 9.89063 1.48125 10.3156 1.90312C10.7375 2.325 11.0219 2.83125 11.1969 3.46875C11.2875 3.80937 11.2875 4.62812 11.1969 4.96875C11.0219 5.60625 10.7375 6.1125 10.3156 6.53437C9.89375 6.95625 9.3875 7.24062 8.75 7.41562C8.40938 7.50625 7.59063 7.50625 7.25 7.41562C6.6125 7.24062 6.10625 6.95625 5.68438 6.53437C4.47813 5.325 4.4 3.40937 5.50625 2.09375C5.98438 1.525 6.76875 1.08437 7.5 0.971875C7.80625 0.925 8.47188 0.953125 8.75 1.025Z" fill="#323433" />
        <path d="M6.3214 9.425C4.5714 9.6375 2.99327 10.6281 1.97765 12.1563C1.38077 13.05 1.04015 14.1063 0.980773 15.2344C0.962023 15.5813 0.965148 15.6219 1.02765 15.7438C1.0714 15.8313 1.1339 15.8938 1.21827 15.9375C1.34015 16 1.38702 16 7.99952 16C14.612 16 14.6589 16 14.7808 15.9375C14.8651 15.8938 14.9276 15.8313 14.9714 15.7438C15.0339 15.6219 15.037 15.5813 15.0183 15.2344C14.937 13.6938 14.3495 12.3438 13.2808 11.2375C12.2683 10.1906 10.962 9.55313 9.5339 9.40625C9.06202 9.35938 6.75577 9.37188 6.3214 9.425ZM9.4839 10.3438C11.5558 10.5813 13.2933 12.0406 13.8714 14.0344C13.9651 14.35 14.062 14.8406 14.062 14.9875V15.0625H7.99952H1.93702V14.9719C1.93702 14.8031 2.06515 14.2156 2.16827 13.8938C2.5089 12.8563 3.1589 11.9625 4.05265 11.2969C4.3714 11.0594 5.07765 10.6969 5.4839 10.5656C5.79327 10.4625 6.1589 10.3844 6.49015 10.3469C6.8089 10.3094 9.1589 10.3094 9.4839 10.3438Z" fill="#323433" />
      </svg>
    )
  },
  {
    id: 'favorites',
    label: 'Избранное',
    icon: (
        <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M14.1164 6.74413C14.7379 6.11284 15.0832 5.2605 15.0762 4.37464C15.0693 3.48878 14.7108 2.64195 14.0795 2.02044C13.7669 1.71271 13.3968 1.46955 12.9902 1.30486C12.5836 1.14017 12.1486 1.05717 11.71 1.06059C10.8241 1.06752 9.9773 1.42607 9.3558 2.05736C9.18703 2.22613 8.97256 2.43328 8.71238 2.67881L7.98897 3.36002L7.26556 2.67881C7.00479 2.43269 6.79003 2.22554 6.62126 2.05736C5.99486 1.43096 5.14528 1.07906 4.25942 1.07906C3.37355 1.07906 2.52397 1.43096 1.89757 2.05736C0.607216 3.3486 0.592274 5.4362 1.85011 6.73358L7.98897 12.8724L14.1164 6.74413ZM1.15131 1.31198C1.55943 0.903747 2.04398 0.579914 2.57728 0.358974C3.11057 0.138035 3.68217 0.0243179 4.25942 0.0243179C4.83667 0.0243179 5.40826 0.138035 5.94156 0.358974C6.47485 0.579914 6.9594 0.903747 7.36752 1.31198C7.5275 1.47254 7.73465 1.67236 7.98897 1.91145C8.24212 1.67236 8.44926 1.47225 8.61041 1.3111C9.42832 0.4806 10.5426 0.00902982 11.7082 0.000128331C12.8738 -0.00877315 13.9952 0.445723 14.8257 1.26363C15.6562 2.08154 16.1278 3.19587 16.1367 4.36147C16.1456 5.52707 15.6911 6.64847 14.8732 7.47897L8.61041 13.7426C8.44558 13.9074 8.22204 14 7.98897 14C7.75589 14 7.53236 13.9074 7.36752 13.7426L1.10297 7.47809C0.299606 6.64955 -0.145629 5.53827 -0.136584 4.38425C-0.127538 3.23022 0.335061 2.12606 1.15131 1.31022V1.31198Z" fill="#323433" />
      </svg>
    )
  },
  {
    id: 'orders',
    label: 'Заказы',
    icon: (
        <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.93959 11.514L1.11581 6.488C0.991283 5.7278 0.929021 5.3484 1.12881 5.0992C1.32791 4.85 1.69465 4.85 2.42743 4.85H12.5728C13.3056 4.85 13.6723 4.85 13.8714 5.0992C14.0712 5.3484 14.0083 5.7278 13.8844 6.488L13.0606 11.514C12.7876 13.18 12.6515 14.0123 12.0939 14.5065C11.5369 15 10.7337 15 9.12716 15H5.87308C4.26657 15 3.46331 15 2.90637 14.5058C2.34874 14.0123 2.21259 13.1793 1.93959 11.5133M11.2632 4.85C11.2632 3.82892 10.8668 2.84965 10.161 2.12764C9.45533 1.40562 8.49816 1 7.50012 1C6.50208 1 5.54491 1.40562 4.83919 2.12764C4.13347 2.84965 3.73699 3.82892 3.73699 4.85" stroke="#323433" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
];





export default function AccountPage() {
  const { getUserProfile, updateUserProfile, user, getAuthHeaders, logout } = useAuth();
  const { favourites, isLoading: favouritesLoading } = useFavourites();
  const [activeTab, setActiveTab] = useState('account');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [orderDetailsError, setOrderDetailsError] = useState('');

  const toggleOrderExpand = async (orderId) => {
    if (expandedOrderId === orderId) {
      setExpandedOrderId(null);
      setSelectedOrderDetails(null);
      setOrderDetailsError('');
    } else {
      setExpandedOrderId(orderId);
      setOrderDetailsLoading(true);
      setOrderDetailsError('');
      
      try {
        const headers = getAuthHeaders();
        const response = await fetch(`/api/order/detail/${orderId}`, {
          headers: {
            ...headers,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Ошибка загрузки деталей заказа');
        }

        const data = await response.json();
        setSelectedOrderDetails(data);
      } catch (error) {
        setOrderDetailsError(error.message);
      } finally {
        setOrderDetailsLoading(false);
      }
    }
  };

  const steps = ['Принят', 'Оплачен', 'Собран', 'Отправлен', 'Получен'];

  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      const result = await getUserProfile();
      if (result.success) {
        setProfileData(result.data);
      }
      setIsLoading(false);
    };

    if (activeTab === 'account') {
      loadProfile();
    }
  }, [activeTab, getUserProfile]);

  useEffect(() => {
    const loadOrders = async () => {
      if (activeTab === 'orders') {
        setOrdersLoading(true);
        setOrdersError('');
        
        try {
          const headers = getAuthHeaders();
          const response = await fetch('/api/order/active-orders/?limit=10', {
            headers: {
              ...headers,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка загрузки заказов');
          }

          const data = await response.json();
          setOrders(data.results || []);
        } catch (error) {
          setOrdersError(error.message);
        } finally {
          setOrdersLoading(false);
        }
      }
    };

    loadOrders();
  }, [activeTab, getAuthHeaders]);



  const handleUpdateProfile = async (formData) => {
    setIsLoading(true);
    setMessage('');
    
    const result = await updateUserProfile(formData);
    if (result.success) {
      // После успешного обновления перезагружаем профиль
      const profileResult = await getUserProfile();
      if (profileResult.success) {
        setProfileData(profileResult.data);
      }
      setIsEditing(false);
      setMessage('Профиль успешно обновлен!');
    } else {
      setMessage(`Ошибка: ${result.error}`);
    }
    
    setIsLoading(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // После выхода перенаправляем на главную страницу
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // В случае ошибки все равно перенаправляем на главную
      window.location.href = '/';
    }
  };



  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className={styles.account__content}>
            <h3 className={styles.account__title}>Мой профиль</h3>
            
            {message && (
              <div className={`${styles.message} ${message.includes('Ошибка') ? styles.message_error : styles.message_success}`}>
                {message}
              </div>
            )}

            {isLoading ? (
              <div className={styles.loading}>Загрузка профиля...</div>
            ) : profileData ? (
              <>
                {isEditing ? (
                  <ProfileEditForm 
                    profileData={profileData} 
                    onSave={handleUpdateProfile}
                    onCancel={() => setIsEditing(false)}
                    isLoading={isLoading}
                  />
                ) : (
                  <ProfileView 
                    profileData={profileData}
                    onEdit={() => setIsEditing(true)}
                    onLogout={handleLogout}
                  />
                )}
              </>
            ) : (
              <div className={styles.error}>Не удалось загрузить профиль</div>
            )}
          </div>
        );
      case 'favorites':
        return (
          <div className={styles.favorites__content}>
            <h3 className={styles.favorites__title}>Избранное</h3>
            
            {favouritesLoading ? (
              <div className={styles.loading}>Загрузка избранного...</div>
            ) : favourites.length > 0 ? (
              <div className={styles.favorites__container}>
                <div className={styles.favorites__count}>
                  {favourites.length} {favourites.length === 1 ? 'товар' : favourites.length < 5 ? 'товара' : 'товаров'}
                </div>
                
                <div className={styles.favorites__grid}>
                  {favourites.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.favorites__empty}>
                <p className={styles.favorites__text}>
                  Нажимайте на <span className={styles.favorites__icon}><svg width="27" height="28" viewBox="0 0 27 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path fillRule="evenodd" clipRule="evenodd" d="M21.6954 14.7257C22.4908 13.9177 22.9327 12.8268 22.9239 11.693C22.915 10.5592 22.4561 9.47537 21.6481 8.67992C21.2481 8.28605 20.7743 7.97484 20.254 7.76405C19.7337 7.55327 19.1769 7.44704 18.6155 7.45143C17.4817 7.46029 16.3978 7.91919 15.6024 8.72717C15.3864 8.94317 15.1119 9.20829 14.7789 9.52254L13.853 10.3944L12.9271 9.52254C12.5934 9.20754 12.3185 8.94242 12.1025 8.72717C11.3008 7.92545 10.2134 7.47506 9.07965 7.47506C7.94585 7.47506 6.85849 7.92545 6.05677 8.72717C4.40527 10.3798 4.38615 13.0517 5.99602 14.7122L13.853 22.5692L21.6954 14.7257ZM5.10165 7.77317C5.624 7.25068 6.24416 6.83621 6.92671 6.55344C7.60926 6.27066 8.34084 6.12512 9.07965 6.12512C9.81846 6.12512 10.55 6.27066 11.2326 6.55344C11.9151 6.83621 12.5353 7.25068 13.0576 7.77317C13.2624 7.97867 13.5275 8.23442 13.853 8.54042C14.177 8.23442 14.4421 7.97829 14.6484 7.77204C15.6952 6.7091 17.1214 6.10555 18.6133 6.09416C20.1051 6.08277 21.5403 6.66447 22.6033 7.71129C23.6662 8.75812 24.2698 10.1843 24.2812 11.6761C24.2925 13.168 23.7108 14.6032 22.664 15.6662L14.6484 23.6829C14.4374 23.8938 14.1513 24.0123 13.853 24.0123C13.5547 24.0123 13.2686 23.8938 13.0576 23.6829L5.03977 15.665C4.01157 14.6046 3.44172 13.1823 3.4533 11.7053C3.46488 10.2283 4.05695 8.81509 5.10165 7.77092V7.77317Z" fill="#323433" fillOpacity="0.5" />
    </svg></span>, чтобы сохранить любимые товары, следить за снижением цен и акциями
                </p>
                <Link href="/catalog" className={styles.favorites__link}>
                  В каталог<svg width="32" height="12" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M31.0303 6.53033C31.3232 6.23744 31.3232 5.76256 31.0303 5.46967L26.2574 0.696699C25.9645 0.403806 25.4896 0.403806 25.1967 0.696699C24.9038 0.989593 24.9038 1.46447 25.1967 1.75736L29.4393 6L25.1967 10.2426C24.9038 10.5355 24.9038 11.0104 25.1967 11.3033C25.4896 11.5962 25.9645 11.5962 26.2574 11.3033L31.0303 6.53033ZM0.5 6.75H30.5V5.25H0.5V6.75Z" fill="#C1A286" />
    </svg>
                </Link>
              </div>
            )}
          </div>
        );
      case 'orders':
        if (expandedOrderId) {
          if (orderDetailsLoading) {
            return (
              <div className={styles.orders__content}>
                <div className={styles.loading}>Загрузка деталей заказа...</div>
              </div>
            );
          }
          
          if (orderDetailsError) {
            return (
              <div className={styles.orders__content}>
                <div className={styles.error}>Ошибка: {orderDetailsError}</div>
                <button className={styles.order__back_button_top} onClick={() => setExpandedOrderId(null)}>
                  Вернуться к списку заказов
                </button>
              </div>
            );
          }
          
          if (!selectedOrderDetails) {
            return (
              <div className={styles.orders__content}>
                <div className={styles.error}>Детали заказа не найдены</div>
                <button className={styles.order__back_button_top} onClick={() => setExpandedOrderId(null)}>
                  Вернуться к списку заказов
                </button>
              </div>
            );
          }
          
          const isCompleted = selectedOrderDetails.status_with_date?.includes('Получен') || false;
          const orderNumber = selectedOrderDetails.id || 'Неизвестный заказ';
          const orderDate = selectedOrderDetails.created_at || '';
          const deliveryDate = selectedOrderDetails.received_date ? new Date(selectedOrderDetails.received_date).toLocaleDateString('ru-RU') : '';
          const totalAmount = selectedOrderDetails.summ || '0';
          const deliveryType = selectedOrderDetails.delivery_type || 'Не указан';
          const address = selectedOrderDetails.delivery_type === 'Самовывоз' 
            ? `${selectedOrderDetails.address?.administrative_area || ''} ${selectedOrderDetails.address?.locality || ''} ${selectedOrderDetails.address?.route || ''} ${selectedOrderDetails.address?.street_number || ''}`.trim() || 'Не указан'
            : selectedOrderDetails.address?.full_address || 'Не указан';
          const productCount = selectedOrderDetails.products?.length || '0';
          const paidFor = selectedOrderDetails.paid_for || '0';
          const payMethod = selectedOrderDetails.pay_method || 'Не указан';
          const message = selectedOrderDetails.message || '';
          
          let currentStep = 0;
          if (selectedOrderDetails.status_with_date?.includes('Ожидает подтверждения')) currentStep = 0;
          else if (selectedOrderDetails.status_with_date?.includes('Оплачен')) currentStep = 1;
          else if (selectedOrderDetails.status_with_date?.includes('Собран')) currentStep = 2;
          else if (selectedOrderDetails.status_with_date?.includes('Отправлен')) currentStep = 3;
          else if (isCompleted) currentStep = 4;
          else currentStep = 0;
          
          const progressWidth = isCompleted ? '100%' : `${(currentStep / (steps.length - 1)) * 100}%`;
          
          return (
            <div className={styles.orders__content}>
              <div className={`${styles.orders__expanded_view} ${isCompleted ? styles.order_completed : ''}`}>
                <div className={styles.order__back_container}>
                  <button className={styles.order__back_button_top} onClick={() => setExpandedOrderId(null)}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.8334 10H4.16675" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10.0001 15.8332L4.16675 9.99984L10.0001 4.1665" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Вернуться
                  </button>
                </div>
                
                <div className={styles.order__expanded_header_info}>
                  {isCompleted ? (
                    <div className={styles.order__collected}>Получен {deliveryDate}</div>
                  ) : (
                    <>
                                          <div className={styles.order__collected}>В обработке</div>
                    <div className={styles.order__progress_status}>Прогресс: <span>{Math.round((currentStep / (steps.length - 1)) * 100)}%</span></div>
                    </>
                  )}
                </div>
                
                <div className={styles.order__steps} style={{ '--progress-width': progressWidth }}>
                  {steps.map((step, index) => (
                    <div
                      key={step}
                      className={`${styles.order__step} ${
                        (isCompleted || index <= currentStep) ? styles.order__step_active : ''
                      }`}
                    >
                      <div className={styles.order__step_dot}></div>
                      <div className={styles.order__step_text}>{step}</div>
                    </div>
                  ))}
                </div>
                
                <div className={styles.order__expanded_details_container}>
                  <div className={styles.order__expanded_details_info}>
                    <div className={styles.order__delivery_method}><span>Способ доставки:</span> {deliveryType}</div>
                    <div className={styles.order__delivery_address}><span>Адрес {deliveryType === 'Самовывоз' ? 'самовывоза' : 'доставки'}:</span> {address}</div>
                    <div className={styles.order__payment_method}><span>Способ оплаты:</span> {payMethod}</div>

                    {!isCompleted && (
                      <div className={styles.order__payment_status}><span>Оплачено:</span> <span className={styles.order__paid}>{paidFor} руб.</span><span className={styles.order__total}> / {totalAmount} руб.</span></div>
                    )}

                    <div className={styles.order__total_cost}>Стоимость товара: <span>{totalAmount} руб.</span></div>
                    <div className={styles.order__quantity}>Количество: <span>{productCount} шт.</span></div>
                    
                    {message && (
                      <div className={styles.order__message}><span>Комментарий к заказу:</span> {message}</div>
                    )}
                 
                    {!isCompleted && (
                      <div className={styles.order__pay_action}>
                        <button className={styles.order__pay_button}>
                          Оплатить
                          <svg width="30" height="30" viewBox="0 0 32 12" fill="none">
                            <path d="M31.0303 6.53033C31.3232 6.23744 31.3232 5.76256 31.0303 5.46967L26.2574 0.696699C25.9645 0.403806 25.4896 0.403806 25.1967 0.696699C24.9038 0.989593 24.9038 1.46447 25.1967 1.75736L29.4393 6L25.1967 10.2426C24.9038 10.5355 24.9038 11.0104 25.1967 11.3033C25.4896 11.5962 25.9645 11.5962 26.2574 11.3033L31.0303 6.53033ZM0.5 6.75H30.5V5.25H0.5V6.75Z" fill="currentColor"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className={styles.orders__expanded_order_wrapper}>
                  <div className={styles.orders__expanded_order_title}>
                    <div className={styles.orders__expanded_order_number}>Заказ {orderNumber}</div>
                    <div className={styles.orders__expanded_order_total}>{totalAmount} ₽</div>
                  </div>
                  
                  <div className={styles.orders__items_list}>
                    {selectedOrderDetails.products && selectedOrderDetails.products.map((product, index) => (
                      <div key={product.id || index} className={styles.order__expanded_item}>
                        <div className={styles.order__expanded_item_image}>
                          {product.photos && product.photos.length > 0 && (
                            <img src={product.photos[0].photo} alt={product.title} />
                          )}
                        </div>
                        <div className={styles.order__expanded_item_info}>
                          <div className={styles.order__expanded_item_title}>{product.title}</div>
                          <div className={styles.order__expanded_item_article}>Артикул: <span>{product.generated_article}</span></div>
                          <div className={styles.order__expanded_item_details}>
                            {product.color && (
                              <div className={styles.order__expanded_item_color_row}>
                                <span className={styles.order__expanded_item_color_label}>Цвет:</span>
                                <span className={styles.order__expanded_item_color_circle} style={{background: `#${product.color.code_hex}`}}></span>
                                <span className={styles.order__expanded_item_color_name}>{product.color.title}</span>
                              </div>
                            )}
                            {product.material && (
                              <div className={styles.order__expanded_item_material}>Материал: {product.material.title}</div>
                            )}
                            {product.sizes && (
                              <div className={styles.order__expanded_item_size}>Размеры: {product.sizes.width}x{product.sizes.height}x{product.sizes.depth} см</div>
                            )}
                            {product.discounted_price && product.discounted_price !== null && product.discounted_price < product.price ? (
                              <>
                                <div className={styles.order__expanded_item_price_info}>Цена: <span style={{textDecoration: 'line-through', color: '#999'}}>{product.price} ₽</span></div>
                                <div className={styles.order__expanded_item_discount}>Скидочная цена: <span style={{color: '#e74c3c', fontWeight: 'bold'}}>{product.discounted_price} ₽</span></div>
                              </>
                            ) : (
                              <div className={styles.order__expanded_item_price_info}>Цена: {product.price} ₽</div>
                            )}
                          </div>
                          <div className={styles.order__expanded_item_price}>
                            {product.discounted_price && product.discounted_price !== null && product.discounted_price < product.price ? product.discounted_price : product.price} ₽
                          </div>
                        </div>
                        <div className={styles.order__expanded_item_quantity}>1 шт.</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        }
        
        return (
          <div className={styles.orders__content}>
            <h3 className={styles.orders__title}>Заказы</h3>
            
            {ordersLoading && (
              <div className={styles.loading}>Загрузка заказов...</div>
            )}
            
            {ordersError && (
              <div className={styles.error}>Ошибка: {ordersError}</div>
            )}
            
            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className={styles.empty_orders}>
                <p>У вас пока нет заказов</p>
                <Link href="/catalog" className={styles.orders__link}>
                  Перейти в каталог
                </Link>
              </div>
            )}
            
            {!ordersLoading && !ordersError && orders.length > 0 && orders.map((order, index) => {
              const isCompleted = order.status_with_date?.includes('Получен') || false;
              const orderId = order.id || index + 1;
              const orderNumber = order.order_number || `Заказ ${index + 1}`;
              const orderDate = order.created_at || '';
              const deliveryDate = order.received_date ? new Date(order.received_date).toLocaleDateString('ru-RU') : '';
              const totalAmount = order.summ || '0';
              const deliveryType = order.delivery_type || 'Не указан';
              const address = order.delivery_type === 'Самовывоз' 
                ? `${order.address?.administrative_area || ''} ${order.address?.locality || ''} ${order.address?.route || ''} ${order.address?.street_number || ''}`.trim() || 'Не указан'
                : order.address?.full_address || 'Не указан';
              const productCount = order.product_count || '0';
              const paidFor = order.paid_for || '0';
              
              let currentStep = 0;
              if (order.status_with_date?.includes('Ожидает подтверждения')) currentStep = 0;
              else if (order.status_with_date?.includes('Оплачен')) currentStep = 1;
              else if (order.status_with_date?.includes('Собран')) currentStep = 2;
              else if (order.status_with_date?.includes('Отправлен')) currentStep = 3;
              else if (isCompleted) currentStep = 4;
              else currentStep = 0;
              
              const progressWidth = isCompleted ? '100%' : `${(currentStep / (steps.length - 1)) * 100}%`;
              
              return (
                <React.Fragment key={`${orderNumber}-${index}`}>
                  <div className={`${styles.order} ${isCompleted ? styles.order_completed : ''}`}>
                    <div className={styles.order__header}>
                      <div className={styles.order__info}>
                        <div className={styles.order__number}>Заказ {orderNumber}</div>
                        <div className={styles.order__date}>Заказан: {orderDate}</div>
                      </div>
                      {isCompleted ? (
                        <div className={styles.order__status}>
                          <div className={styles.order__status_text}>Получен</div>
                          <div className={styles.order__delivery_date}>{deliveryDate}</div>
                        </div>
                      ) : (
                        <div className={styles.order__delivery}>
                          <div className={styles.order__delivery_text}>Ожидаемое получение</div>
                          <div className={styles.order__delivery_date}>{order.status_with_date || 'Статус обновляется'}</div>
                          <div className={styles.order__delivery_days}>15 дней</div>
                        </div>
                      )}
                    </div>

                    <div
                      className={styles.order__steps}
                      style={{ '--progress-width': progressWidth }}
                    >
                      {steps.map((step, stepIndex) => (
                        <div
                          key={step}
                          className={`${styles.order__step} ${
                            (isCompleted || stepIndex <= currentStep) ? styles.order__step_active : ''
                          }`}
                        >
                          <div className={styles.order__step_dot}></div>
                          <div className={styles.order__step_text}>{step}</div>
                        </div>
                      ))}
                    </div>

                    <div className={styles.order__details}>
                      {isCompleted ? (
                        <>
                          <div className={styles.order__collected}>Получен {deliveryDate}</div>
                          <div className={styles.order__delivery_method}><span>Способ доставки:</span> {deliveryType}</div>
                          <div className={styles.order__delivery_address}><span>Адрес {deliveryType === 'Самовывоз' ? 'самовывоза' : 'доставки'}:</span> {address}</div>
                          <div className={styles.order__total_cost}>Стоимость товара: <span>{totalAmount} руб.</span></div>
                          <div className={styles.order__quantity}>Количество: <span>{productCount} шт.</span></div>
                        </>
                      ) : (
                        <>
                          <div className={styles.order__collected}>Собран 15.01.2025</div>
                          <div className={styles.order__delivery_method}><span>Способ доставки:</span> {deliveryType}</div>
                          <div className={styles.order__delivery_address}><span>Адрес {deliveryType === 'Самовывоз' ? 'самовывоза' : 'доставки'}:</span> {address}</div>
                          <div className={styles.order__payment_status}>Оплачено: <span>{paidFor} руб.</span><span> / {totalAmount} руб.</span></div>
                          <div className={styles.order__progress_status}>Прогресс: <span>{Math.round((currentStep / (steps.length - 1)) * 100)}%</span></div>
                          <div className={styles.order__total_cost}>Стоимость товара: <span>{totalAmount} руб.</span></div>
                          <div className={styles.order__quantity}>Количество: <span>{productCount} шт.</span></div>
                          <div className={styles.order__pay_action}>
                            <button className={styles.order__pay_button}>
                              Оплатить
                              <svg width="30" height="30" viewBox="0 0 32 12" fill="none">
                                <path d="M31.0303 6.53033C31.3232 6.23744 31.3232 5.76256 31.0303 5.46967L26.2574 0.696699C25.9645 0.403806 25.4896 0.403806 25.1967 0.696699C24.9038 0.989593 24.9038 1.46447 25.1967 1.75736L29.4393 6L25.1967 10.2426C24.9038 10.5355 24.9038 11.0104 25.1967 11.3033C25.4896 11.5962 25.9645 11.5962 26.2574 11.3033L31.0303 6.53033ZM0.5 6.75H30.5V5.25H0.5V6.75Z" fill="currentColor"/>
                              </svg>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <div className={styles.order__details_button} onClick={() => toggleOrderExpand(orderId)}>
                    Подробнее
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className={styles.account}>
      <div className={styles.account__container}>
        <div className={styles.account__menu}>
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`${styles.account__menu_item} ${activeTab === item.id ? styles.account__menu_item_active : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={styles.account__menu_icon}>{item.icon}</span>
              <span className={styles.account__menu_label}>{item.label}</span>
            </button>
          ))}
        </div>
        <div className={styles.account__main}>
          {renderContent()}
        </div>
      </div>
    </main>
  );
}

const ProfileView = ({ profileData, onEdit, onLogout }) => {
  const user_data = profileData?.user_data || {};
  const can_edit = profileData?.can_edit || false;
  
  return (
    <>
      <div className={styles.account__form}>
        <div className={styles.account__field}>
          <label className={styles.account__label}>Фамилия</label>
          <div className={styles.account__value}>{user_data.last_name || '—'}</div>
        </div>
        <div className={styles.account__field}>
          <label className={styles.account__label}>Имя</label>
          <div className={styles.account__value}>{user_data.first_name || '—'}</div>
        </div>
        <div className={styles.account__field}>
          <label className={styles.account__label}>Отчество</label>
          <div className={styles.account__value}>{user_data.patronymic || '—'}</div>
        </div>
        <div className={styles.account__field}>
          <label className={styles.account__label}>Электронная почта</label>
          <div className={styles.account__value}>{user_data.email || '—'}</div>
        </div>
        <div className={styles.account__field}>
          <label className={styles.account__label}>Номер телефона</label>
          <div className={styles.account__value}>{user_data.phone || '—'}</div>
        </div>
      </div>
      
      <div className={styles.account__actions}>
        <button className={styles.account__button} onClick={onEdit}>
          Редактировать данные
        </button>
        <Link href="/auth/change-password" className={styles.account__button}>
          Обновить пароль
        </Link>
        <button className={styles.account__button_logout} onClick={onLogout}>
          Выйти
        </button>
      </div>
    </>
  );
};

const ProfileEditForm = ({ profileData, onSave, onCancel, isLoading }) => {
  const user_data = profileData?.user_data || {};
  const [formData, setFormData] = useState({
    first_name: user_data.first_name || '',
    last_name: user_data.last_name || '',
    patronymic: user_data.patronymic || '',
    phone: user_data.phone || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <form className={styles.account__form} onSubmit={handleSubmit}>
      <div className={styles.account__field}>
        <label className={styles.account__label}>Фамилия</label>
        <input
          type="text"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          className={styles.account__input}
          maxLength={100}
        />
      </div>
      <div className={styles.account__field}>
        <label className={styles.account__label}>Имя</label>
        <input
          type="text"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          className={styles.account__input}
          maxLength={100}
          required
        />
      </div>
      <div className={styles.account__field}>
        <label className={styles.account__label}>Отчество</label>
        <input
          type="text"
          name="patronymic"
          value={formData.patronymic}
          onChange={handleChange}
          className={styles.account__input}
          maxLength={100}
        />
      </div>
      <div className={styles.account__field}>
        <label className={styles.account__label}>Номер телефона</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={styles.account__input}
          pattern="^\+?1?\d{9,15}$"
          maxLength={20}
          placeholder="+7 900 000-00-00"
        />
      </div>
      
      <div className={styles.account__actions}>
        <button 
          type="submit" 
          className={styles.account__button}
          disabled={isLoading}
        >
          {isLoading ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button 
          type="button" 
          className={styles.account__button_secondary}
          onClick={onCancel}
          disabled={isLoading}
        >
          Отмена
        </button>
      </div>
    </form>
  );
}; 