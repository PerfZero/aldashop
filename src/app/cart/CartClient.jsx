'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';
import { useCart } from '../components/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../../components/AuthModal';

export default function CartClient() {
  const { cartItems, removeFromCart, removeAllFromCart, updateQuantity, clearCart } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [showPromoCodeInput, setShowPromoCodeInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [innStatus, setInnStatus] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    inn: '',
    phone: '',
    email: '',
    region: 'Краснодарский край',
    city: 'Сочи',
    street: '',
    house: '',
    pickupAddress: '',
    apartment: '',
    isLegalEntity: false,
    delivery: 'pickup',
    payment: 'card',
    comment: '',
    coordinates: null,
    fullAddress: ''
  });
  const [mapCenter, setMapCenter] = useState([43.585472, 39.723098]);
  const [userLocation, setUserLocation] = useState(null);
  const [autocompleteData, setAutocompleteData] = useState(null);
  const [isPickupDropdownOpen, setIsPickupDropdownOpen] = useState(false);
  const [mapComponents, setMapComponents] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [showRemoveAllModal, setShowRemoveAllModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  useEffect(() => {
    calculateTotal();
  }, [cartItems, discount]);

  useEffect(() => {
    if (isMapLoading && typeof window !== 'undefined' && window.ymaps) {
      const checkMapElement = () => {
        const mapElement = document.getElementById('map');
        if (mapElement) {
          initMap();
        } else {
          setTimeout(checkMapElement, 200);
        }
      };
      
      setTimeout(checkMapElement, 500);
    }
  }, [isMapLoading]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAutocompleteData();
    } else {
      setAutocompleteData(null);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    
    const loadYandexMaps = () => {
      if (typeof window !== 'undefined' && window.ymaps) {
        window.ymaps.ready(() => {
          setTimeout(() => {
            initMap();
          }, 500);
        });
      } else {
        setTimeout(loadYandexMaps, 500);
      }
    };

    setTimeout(() => {
      loadYandexMaps();
    }, 1000);
  }, [mapCenter]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
        }
      );
    }
  }, []);

  useEffect(() => {
    if (!formData.isLegalEntity) {
      setInnStatus(null);
    }
  }, [formData.isLegalEntity]);

  const fetchAutocompleteData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const response = await fetch('/api/order/autocomplete', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAutocompleteData(data);
        
        if (data.pickup_addresses && data.pickup_addresses.length > 0) {
          setFormData(prev => ({
            ...prev,
            pickupAddress: data.pickup_addresses[0].full_address
          }));
        }
      }
    } catch (error) {
    }
  };

  const calculateTotal = () => {
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalPrice(total - discount);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'address') {
      setFormData(prev => ({
        ...prev,
        fullAddress: value
      }));
    }

    if (name === 'inn' && formData.isLegalEntity) {
      const innValue = value.replace(/\D/g, '');
      
      if (innValue === '435343353453') {
        setInnStatus('valid');
      } else if (innValue.length >= 10) {
        setInnStatus('invalid');
      } else {
        setInnStatus(null);
      }
    }
  };
  
  const handleRadioChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePromoCodeSubmit = async () => {
    if (!promoCode.trim()) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/order/check-promo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ promo_code: promoCode })
      });
      
      if (response.ok) {
        const data = await response.json();
        setDiscount(data.discount || 0);
        setShowPromoCodeInput(false);
      } else {
        alert('Неверный промокод');
      }
    } catch (error) {
      alert('Ошибка при проверке промокода');
    }
  };

  const initMap = () => {
    if (typeof window !== 'undefined' && window.ymaps) {
      const map = new window.ymaps.Map('map', {
        center: mapCenter,
        zoom: 12,
        controls: ['zoomControl']
      });
      
      setMapComponents({ map, ymaps: window.ymaps });
      setIsMapLoading(false);
      
      map.events.add('click', handleMapClick);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    const orderData = {
      email: formData.email,
      message: formData.comment,
      pickup: formData.delivery === 'pickup',
      pay_method: formData.payment,
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone
    };

    if (formData.delivery === 'address') {
      orderData.delivery_address = {
        administrative_area: formData.region,
        locality: formData.city,
        route: formData.street,
        street_number: formData.house,
        apartment: formData.apartment
      };
    } else {
      orderData.pickup_address = formData.pickupAddress;
    }

    if (formData.isLegalEntity && formData.inn) {
      orderData.legal_person = {
        full_name: formData.inn,
        inn: formData.inn,
        ogrn: '1234567890123',
        legal_address: `${formData.region}, ${formData.city}`,
        bank_name: 'ПАО Сбербанк',
        bik: '040349602',
        correspondent_account: '30101810100000000602',
        payment_account: '40702810123456789012',
        signatory_name: `${formData.firstName} ${formData.lastName}`,
        signatory_position: 'Генеральный директор'
      };
    }

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/order/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const result = await response.json();
        alert('Заказ успешно оформлен!');
        clearCart();
      } else {
        const error = await response.json();
        alert(`Ошибка при оформлении заказа: ${error.error}`);
      }
    } catch (error) {
      alert('Ошибка при оформлении заказа');
    }
  };

  const handleSelectPickupAddress = (address) => {
    setFormData(prev => ({
      ...prev,
      pickupAddress: address
    }));
    setIsPickupDropdownOpen(false);
  };

  const handleMapClick = (event) => {
    const coords = event.get('coords');
    
    setFormData(prev => ({
      ...prev,
      coordinates: coords
    }));
    
    if (mapComponents?.map && mapComponents?.ymaps) {
      mapComponents.map.geoObjects.removeAll();
      
      mapComponents.ymaps.geocode(coords).then(function (res) {
        const address = res.geoObjects.get(0).getAddressLine();
        
        const placemark = new mapComponents.ymaps.Placemark(coords, {
          balloonContent: `Адрес: ${address}<br>Координаты: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
        }, {
          preset: 'islands#redDotIcon'
        });
        
        mapComponents.map.geoObjects.add(placemark);
        
        setFormData(prev => ({
          ...prev,
          fullAddress: address
        }));
      }).catch(function (error) {
        console.error('Ошибка геокодирования:', error);
      });
    }
  };

  const handlePickupAddressClick = (address) => {
    setFormData(prev => ({
      ...prev,
      pickupAddress: address.full_address
    }));
  };

  const handleRemoveClick = (item, event) => {
    if (event.ctrlKey || event.metaKey) {
      // Ctrl+Click или Cmd+Click для полного удаления
      setItemToRemove(item);
      setShowRemoveAllModal(true);
    } else {
      // Обычный клик для уменьшения количества
      removeFromCart(item.id);
    }
  };

  const handleRemoveAll = async () => {
    if (itemToRemove) {
      await removeAllFromCart(itemToRemove.id);
      setShowRemoveAllModal(false);
      setItemToRemove(null);
    }
  };


  if (cartItems.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyText}>Ваша корзина пуста</p>
        <Link href="/" className={styles.continueButton}>
          Продолжить покупки
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className={styles.cartItems}>
        {cartItems.map(item => (
          <div key={item.id} className={styles.cartItem}>
            <div className={styles.itemLeft}>
              <div className={styles.productImage}>
                <img src={item.image} alt={item.name} />
              </div>
              
              {item.isBestseller && (
                <div className={styles.bestsellerBadge}>
                  <span>Бестселлер</span>
                </div>
              )}
            </div>
            
            <div className={styles.itemContent}>
              <h3 className={styles.productName}>{item.name}</h3>
              <p className={styles.productArticle}>Артикул: {item.article}</p>
              
              <div className={styles.productDetails}>
                <div className={styles.colorMaterial}>
                  <span>Цвет: {item.color || 'Не указан'}</span>
                  <span className={styles.detailDivider}></span>
                  <span>Размер: {item.dimensions || 'Не указаны'}</span>
                </div>
                
                <div className={styles.quantityBlock}>
                  <div className={styles.quantityControls}>
                    <button 
                      className={styles.minusButton} 
                      onClick={async () => await updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <svg width="10" height="2" viewBox="0 0 10 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 1H1" stroke="#C1AF86" strokeWidth="1" strokeLinecap="round"/>
                      </svg>
                    </button>
                    <span className={styles.quantity}>{item.quantity}</span>
                    <button 
                      className={styles.plusButton} 
                      onClick={async () => await updateQuantity(item.id, item.quantity + 1)}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 1V9M9 5H1" stroke="#C1AF86" strokeWidth="1" strokeLinecap="round"/>
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className={styles.priceBlock}>
                  <span className={styles.price}>{item.price.toLocaleString()}</span>
                  <span className={styles.currency}>₽</span>
                </div>
              </div>
              
              <button 
                className={styles.removeButton} 
                onClick={(event) => handleRemoveClick(item, event)}
                title="Удалить товар (Ctrl+Click для полного удаления)"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 1L1 13M1 1L13 13" stroke="#C1AF86" strokeWidth="1" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.orderSummary}>
        <h2 className={styles.summaryTitle}>Информация о заказе</h2>
        
        <div className={styles.summaryContent}>
          <div className={styles.summaryRow}>
            <div className={styles.summaryRowTitle}>
              <span>{cartItems.length} {cartItems.length === 1 ? 'товар' : cartItems.length < 5 ? 'товара' : 'товаров'}</span>
              <div className={styles.summaryRowPrice}>
                <span>{cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                ₽
              </div>
            </div>
          </div>
          
          <div className={styles.summaryRow}>
            <div className={styles.summaryRowTitle}>
              <span>Скидка</span>
              <div className={styles.summaryRowPrice}>
                <span>{discount.toLocaleString()}</span>
                ₽
              </div>
            </div>
          </div>
          
          {isAuthenticated && (
            <>
              {showPromoCodeInput ? (
                <div className={styles.promoCodeForm}>
                  <div className={styles.inputContainer}>
                    <input 
                      type="text" 
                      className={styles.promoCodeInput} 
                      placeholder=" "
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <span className={styles.floatingLabel}>Промокод</span>
                  </div>
                  <button 
                    type="button" 
                    className={styles.promoCodeButton}
                    onClick={handlePromoCodeSubmit}
                  >
                    Активировать
                  </button>
                </div>
              ) : (
                <div 
                  className={styles.promoCode}
                  onClick={() => setShowPromoCodeInput(true)}
                >
                  <span>У меня есть промокод</span>
                </div>
              )}
            </>
          )}
          
          <div className={styles.summaryRow}>
            <div className={styles.summaryRowTitle}>
              <span>Доставка</span>
              <span>Сочи</span>
            </div>
          </div>
          
          <div className={styles.summaryRow}>
            <div className={styles.summaryRowTitle}>
              <span>Итого</span>
              <div className={styles.summaryTotal}>
                <span>{totalPrice.toLocaleString()}</span>
                <span className={styles.currency}>₽</span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          type="button" 
          className={styles.confirmButton}
          onClick={handleSubmit}
        >
          {isAuthenticated ? 'Подтвердить заказ' : 'Войти для оформления заказа'}
          <svg width="32" height="12" viewBox="0 0 32 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M31.0303 6.53033C31.3232 6.23744 31.3232 5.76256 31.0303 5.46967L26.2574 0.696699C25.9645 0.403806 25.4896 0.403806 25.1967 0.696699C24.9038 0.989593 24.9038 1.46447 25.1967 1.75736L29.4393 6L25.1967 10.2426C24.9038 10.5355 24.9038 11.0104 25.1967 11.3033C25.4896 11.5962 25.9645 11.5962 26.2574 11.3033L31.0303 6.53033ZM0.5 6.75H30.5V5.25H0.5V6.75Z" fill="white"/>
          </svg>
        </button>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />

      {showRemoveAllModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Удалить товар полностью?</h3>
            <p>Товар "{itemToRemove?.name}" будет полностью удален из корзины.</p>
            <div className={styles.modalButtons}>
              <button 
                className={styles.modalButtonCancel}
                onClick={() => {
                  setShowRemoveAllModal(false);
                  setItemToRemove(null);
                }}
              >
                Отмена
              </button>
              <button 
                className={styles.modalButtonConfirm}
                onClick={handleRemoveAll}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 