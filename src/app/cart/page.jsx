'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';
import { useCart } from '../components/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import AuthModal from '../../components/AuthModal';

export default function CartPage() {
  const { cartItems, removeFromCart, removeAllFromCart, updateQuantity, clearCart, isLoading } = useCart();
  const { isAuthenticated, getAuthHeaders } = useAuth();
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [showPromoCodeInput, setShowPromoCodeInput] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeStatus, setPromoCodeStatus] = useState(null);
  const [promoCodeError, setPromoCodeError] = useState('');
  const [innStatus, setInnStatus] = useState(null);
  const [autocompleteData, setAutocompleteData] = useState(null);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    patronymic: '',
    inn: '',
    phone: '',
    email: '',
    region: 'Краснодарский край',
    city: 'Сочи',
    street: '',
    house: '',
    pickupAddress: 'ул. Кипарисовая, 56',
    pickupAddressId: null,
    apartment: '',
    isLegalEntity: false,
    delivery: 'pickup',
    payment: 'sbp',
    comment: '',
    coordinates: null,
    fullAddress: '',
    legalFullName: '',
    legalKpp: '',
    legalOgrn: '',
    legalAddress: '',
    legalBankName: '',
    legalBik: '',
    legalCorrespondentAccount: '',
    legalPaymentAccount: '',
    legalSignatoryName: '',
    legalSignatoryPosition: ''
  });
  const [isPickupDropdownOpen, setIsPickupDropdownOpen] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [pickupAddresses, setPickupAddresses] = useState([
    'ул. Кипарисовая, 56',
    'ул. Морская, 24',
    'ул. Морская, 24',
    'ул. Морская, 24',
    'ул. Морская, 24',
    'ул. Приморская, 118'
  ]);

  useEffect(() => {
    calculateTotal();
  }, [cartItems, discount]);

  useEffect(() => {
    const loadAutocompleteData = async () => {
      console.log('Проверяем авторизацию:', isAuthenticated);
      if (isAuthenticated) {
        setIsLoadingAutocomplete(true);
        try {
          console.log('Отправляем запрос на автодополнение...');
          const response = await fetch('/api/order/autocomplete/', {
            headers: getAuthHeaders(),
          });
          
          console.log('Статус ответа:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Полученные данные автодополнения:', data);
            setAutocompleteData(data);
            
            if (data.pickup_addresses && data.pickup_addresses.length > 0) {
              const pickupAddressesList = data.pickup_addresses.map(address => address.full_address);
              setPickupAddresses(pickupAddressesList);
              console.log('Обновлены адреса пунктов выдачи:', pickupAddressesList);
            }
            
            if (data.profile_fields) {
              console.log('Заполняем поля профиля:', data.profile_fields);
              setFormData(prev => {
                const newData = {
                  ...prev,
                  firstName: data.profile_fields.first_name || prev.firstName,
                  lastName: data.profile_fields.last_name || prev.lastName,
                  patronymic: data.profile_fields.patronymic || prev.patronymic,
                  phone: data.profile_fields.phone || prev.phone,
                  email: data.emails?.[0] || prev.email,
                };
                console.log('Новые данные формы:', newData);
                return newData;
              });
            } else {
              console.log('Нет данных profile_fields в ответе');
            }
          } else {
            console.log('Ошибка ответа:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('Ошибка при загрузке данных автодополнения:', error);
        } finally {
          setIsLoadingAutocomplete(false);
        }
      } else {
        console.log('Пользователь не авторизован');
      }
    };

    loadAutocompleteData();
  }, [isAuthenticated, getAuthHeaders]);

  useEffect(() => {
    if (promoCodeStatus === 'valid') {
      setPromoCodeStatus(null);
      setPromoCodeError('');
      setDiscount(0);
    }
  }, [cartItems]);

  useEffect(() => {
    if (!formData.isLegalEntity) {
      setInnStatus(null);
    }
  }, [formData.isLegalEntity]);

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
  
  const handleToggleChange = (name) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };
  
  const handlePromoCodeSubmit = async (e) => {
    e.preventDefault();
    
    if (!promoCode.trim()) {
      setPromoCodeError('Введите промокод');
      return;
    }
    
    setPromoCodeStatus('loading');
    setPromoCodeError('');
    
    try {
      const currentTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const response = await fetch('/api/order/check-promo/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promo_code: promoCode.trim(),
          current_total: currentTotal
        })
      });
      
      const data = await response.json();
      
      if (response.ok && data.is_valid) {
        setPromoCodeStatus('valid');
        setDiscount(data.discount || 0);
        setPromoCodeError('');
      } else {
        setPromoCodeStatus('invalid');
        setDiscount(0);
        setPromoCodeError('Неверный промокод');
      }
    } catch (error) {
      console.error('Ошибка при проверке промокода:', error);
      setPromoCodeStatus('invalid');
      setDiscount(0);
      setPromoCodeError('Ошибка при проверке промокода');
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
      message: formData.comment || null,
      pickup: formData.delivery === 'pickup',
      pay_method: formData.payment,
      first_name: formData.firstName,
      last_name: formData.lastName,
      patronymic: formData.patronymic,
      phone: formData.phone
    };

    if (promoCodeStatus === 'valid' && promoCode) {
      orderData.promo_code = promoCode;
    }

    if (formData.delivery === 'address') {
      orderData.delivery_address = {
        administrative_area: formData.region || 'Краснодарский край',
        locality: formData.city,
        route: formData.street || '',
        street_number: formData.house || '',
        postal_code: '',
        entrance: '',
        floor: '',
        apartment: formData.apartment || ''
      };
    }

    if (formData.delivery === 'pickup') {
      let pickupId = formData.pickupAddressId;
      
      if (!pickupId && autocompleteData?.pickup_addresses) {
        const pickupAddress = autocompleteData.pickup_addresses.find(
          addr => addr.full_address === formData.pickupAddress
        );
        if (pickupAddress) {
          pickupId = pickupAddress.id;
        }
      }
      
      if (pickupId) {
        orderData.pickup_address = {
          id: pickupId
        };
      } else {
        orderData.pickup_address = {
          address: formData.pickupAddress
        };
      }
    }

    if (formData.isLegalEntity && formData.inn) {
      orderData.legal_person = {
        full_name: formData.legalFullName || formData.lastName || '',
        inn: formData.inn,
        kpp: formData.legalKpp || '',
        ogrn: formData.legalOgrn || '',
        legal_address: formData.legalAddress || '',
        bank_name: formData.legalBankName || '',
        bik: formData.legalBik || '',
        correspondent_account: formData.legalCorrespondentAccount || '',
        payment_account: formData.legalPaymentAccount || '',
        signatory_name: formData.legalSignatoryName || '',
        signatory_position: formData.legalSignatoryPosition || ''
      };
    }

    console.log('Отправляем заказ:', orderData);

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (isAuthenticated) {
        const authHeaders = getAuthHeaders();
        Object.assign(headers, authHeaders);
      }
      
      const response = await fetch('/api/order/create-order/', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      console.log('Ответ сервера:', result);

      if (response.ok) {
        alert(`Заказ успешно оформлен!`);
        clearCart();
      } else {
        alert(`Ошибка при оформлении заказа: ${result.error || 'Неизвестная ошибка'}`);
      }
    } catch (error) {
      console.error('Ошибка при отправке заказа:', error);
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

  const handleSelectPickupAddressFromAPI = (address) => {
    setFormData(prev => ({
      ...prev,
      pickupAddress: address.full_address,
      pickupAddressId: address.id
    }));
    setIsPickupDropdownOpen(false);
  };

  const handleSelectSavedAddress = (address) => {
    setFormData(prev => ({
      ...prev,
      city: address.locality || prev.city,
      street: address.route || prev.street,
      house: address.street_number || prev.house,
      apartment: address.apartment || prev.apartment,
      fullAddress: address.full_address || prev.fullAddress,
      coordinates: address.coordinates_x && address.coordinates_y 
        ? [parseFloat(address.coordinates_y), parseFloat(address.coordinates_x)]
        : prev.coordinates
    }));
    setSelectedAddressId(address.id);
    setShowSavedAddresses(false);
  };

  const handleRemoveClick = (item) => {
    // Удаляем весь товар
    removeFromCart(item.id);
  };



  const handleMapClick = (event) => {
    const coords = event.get('coords');
    console.log('Координаты клика:', coords);
    
    ymaps.geocode(coords).then((res) => {
      const firstGeoObject = res.geoObjects.get(0);
      const address = firstGeoObject.getAddressLine();
      const components = firstGeoObject.properties.get('metaDataProperty').GeocoderMetaData.Address.Components;
      
      console.log('Полный адрес от Яндекс:', address);
      console.log('Компоненты адреса:', components);
      
      let region = '';
      let city = '';
      let street = '';
      let house = '';
      
      components.forEach(component => {
        if (component.kind === 'administrative_area_level_1') {
          region = component.name;
        } else if (component.kind === 'locality') {
          city = component.name;
        } else if (component.kind === 'route') {
          street = component.name;
        } else if (component.kind === 'street_number') {
          house = component.name;
        }
      });
      
      setFormData(prev => ({
        ...prev,
        region: region || prev.region,
        city: city || prev.city,
        street: street || prev.street,
        house: house || prev.house,
        coordinates: coords,
        fullAddress: address
      }));
    });
  };

  if (isLoading) {
    return (
      <div className={styles.empty}>
        <h1 className={styles.title}>Корзина</h1>
        <p className={styles.emptyText}>Загрузка корзины...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className={styles.empty}>
        <h1 className={styles.title}>Корзина</h1>
        <p className={styles.emptyText}>Ваша корзина пуста</p>
        <Link href="/" className={styles.continueButton}>
          Продолжить покупки
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.cartContent}>
        <div className={styles.cartLeft}>
          <h1 className={styles.title}>Корзина</h1>

          <div className={styles.cartItems}>
            {cartItems.map((item, index) => (
              <div key={`${item.id}-${index}`} className={styles.cartItem}>
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
                      <span>{item.color || 'Не указан'}</span>
                      <span className={styles.detailDivider}></span>
                      <span>{item.material || 'Не указан'}</span>
                      <span className={styles.detailDivider}></span>
                      <span>{item.dimensions || 'Не указаны'}</span>
                    </div>
                    
                    <div className={styles.quantityPrice}>
                      <div className={styles.quantityControls}>
                        <div className={styles.quantityButtons}>
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
                  </div>
                  
                  <button 
                    className={styles.removeButton} 
                    onClick={() => handleRemoveClick(item)}
                    title="Удалить товар"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M13 1L1 13M1 1L13 13" stroke="#C1AF86" strokeWidth="1" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {isAuthenticated && (
            <form className={styles.checkoutForm} onSubmit={handleSubmit}>
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>
                  Покупатель
                  {isLoadingAutocomplete && <span className={styles.loadingIndicator}>Загрузка данных...</span>}
                </h2>
                <div className={styles.formContent}>
                  <div className={styles.switchField}>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={formData.isLegalEntity}
                        onChange={() => handleToggleChange('isLegalEntity')}
                      />
                      <span className={styles.slider}></span>
                    </label>
                    <span className={styles.switchLabel}>Заказ от юридического лица</span>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.inputField}>
                      <div className={styles.inputContainer}>
                        <input 
                          type="text" 
                          name="firstName" 
                          placeholder=" " 
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                        />
                        <span className={styles.floatingLabel}>
                          Имя <span className={styles.requiredStar}>*</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.inputField}>
                      <div className={styles.inputContainer}>
                        <input 
                          type="text" 
                          name="lastName" 
                          placeholder=" " 
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                        />
                        <span className={styles.floatingLabel}>
                          Фамилия <span className={styles.requiredStar}>*</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.formRow}>
                    <div className={styles.inputField}>
                      <div className={styles.inputContainer}>
                        <input 
                          type="text" 
                          name="patronymic" 
                          placeholder=" " 
                          required
                          value={formData.patronymic}
                          onChange={handleInputChange}
                        />
                        <span className={styles.floatingLabel}>
                          Отчество <span className={styles.requiredStar}>*</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {formData.isLegalEntity && innStatus === 'invalid' && (
                    <div className={styles.innMessage}>
                      <p className={styles.innInvalid}>
                        Компания не найдена. Мы свяжемся с вами в рабочее время для уточнения данных. Вы можете продолжить оформление заказа.
                      </p>
                      <button 
                        type="button" 
                        className={styles.innConfirmButton}
                        onClick={() => setInnStatus('confirmed')}
                      >
                        Подтвердить
                      </button>
                    </div>
                  )}
                  
                  {formData.isLegalEntity && innStatus === 'valid' && (
                    <div className={styles.innMessage}>
                      <p className={styles.innValid}>
                        ИНН: {formData.inn}
                      </p>
                    </div>
                  )}

                  {autocompleteData?.legal_persons && autocompleteData.legal_persons.length > 0 && (
                    <div className={styles.savedAddresses}>
                      <h4>Сохраненные юридические лица</h4>
                      {autocompleteData.legal_persons.map((legalPerson, index) => (
                        <div 
                          key={`legal-${legalPerson.id}-${index}`}
                          className={styles.savedAddress}
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              inn: legalPerson.inn || prev.inn,
                              isLegalEntity: true
                            }));
                            setInnStatus('valid');
                          }}
                        >
                          {legalPerson.full_name} (ИНН: {legalPerson.inn})
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className={styles.formRow}>
                    <div className={styles.inputField}>
                      <div className={styles.inputContainer}>
                        <input 
                          type="tel" 
                          name="phone" 
                          placeholder=" " 
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                        />
                        <span className={styles.floatingLabel}>
                          Телефон   
                        </span>
                      </div>
                    </div>
                    
                    <div className={styles.inputField}>
                      <div className={styles.inputContainer}>
                        <input 
                          type="email" 
                          name="email" 
                          placeholder=" " 
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                        />
                        <span className={styles.floatingLabel}>
                          Электронная почта <span className={styles.requiredStar}>*</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Адрес доставки</h2>
                <div className={styles.formContent}>
                  <div className={styles.addressField}>
                    <div className={styles.inputContainer}>
                      <input 
                        type="text" 
                        name="city" 
                        placeholder=" "
                        value={formData.city}
                        onChange={handleInputChange}
                        className={styles.cityField}
                      />
                      <span className={styles.floatingLabel}>Населенный пункт <span className={styles.requiredStar}>*</span></span>
                    </div>
                  </div>
                  
                  <div className={styles.deliveryOptions}>
                    <div className={styles.radioField}>
                      <label className={styles.radioOption}>
                        <input 
                          type="radio" 
                          name="delivery" 
                          value="address"
                          checked={formData.delivery === 'address'}
                          onChange={handleRadioChange}
                        />
                        <div className={styles.radioContent}>
                          <span className={styles.radioCircle}></span>
                          <div>
                            <p className={styles.radioTitle}>Доставка до адреса</p>
                            <p className={styles.radioDesc}>Введите адрес или выберите точку на карте</p>
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    <div className={styles.radioField}>
                      <label className={styles.radioOption}>
                        <input 
                          type="radio" 
                          name="delivery" 
                          value="pickup"
                          checked={formData.delivery === 'pickup'}
                          onChange={handleRadioChange}
                        />
                        <div className={styles.radioContent}>
                          <span className={styles.radioCircle}></span>
                          <span className={styles.radioTitle}>Самовывоз из пункта выдачи</span>
                        </div>
                      </label>
                    </div>
                    
                    {formData.delivery === 'pickup' && (
                      <div className={styles.addressField}>
                        <div className={styles.customSelect}>
                          <div 
                            className={styles.selectHeader} 
                            onClick={() => setIsPickupDropdownOpen(!isPickupDropdownOpen)}
                          >
                            <div className={styles.inputContainer}>
                              <input 
                                type="text" 
                                name="pickupAddress" 
                                placeholder=" "
                                value={formData.pickupAddress}
                                onChange={handleInputChange}
                                className={styles.pickupAddressField}
                                readOnly
                              />
                              <span className={styles.floatingLabel}>
                                Адрес пункта выдачи <span className={styles.requiredStar}>*</span>
                              </span>
                            </div>
                            <div className={styles.selectArrow}>
                              <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 1L7 7L13 1" stroke="#C1AF86" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                          
                          {isPickupDropdownOpen && (
                            <div className={styles.selectOptions}>
                              {autocompleteData?.pickup_addresses && autocompleteData.pickup_addresses.length > 0 ? (
                                autocompleteData.pickup_addresses.map((address, index) => (
                                  <div 
                                    key={`pickup-${address.id}-${index}`} 
                                    className={styles.selectOption}
                                    onClick={() => handleSelectPickupAddressFromAPI(address)}
                                  >
                                    {address.full_address}
                                  </div>
                                ))
                              ) : (
                                pickupAddresses.map((address, index) => (
                                  <div 
                                    key={index} 
                                    className={styles.selectOption}
                                    onClick={() => handleSelectPickupAddress(address)}
                                  >
                                    {address}
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {formData.delivery === 'address' && (
                      <div className={styles.addressToDelivery}>
                        {autocompleteData?.delivery_addresses && autocompleteData.delivery_addresses.length > 0 && (
                          <div className={styles.savedAddresses}>
                            <h4>Сохраненные адреса</h4>
                            {autocompleteData.delivery_addresses.map((address, index) => (
                              <div 
                                key={`delivery-${address.id}-${index}`}
                                className={`${styles.savedAddress} ${selectedAddressId === address.id ? styles.selected : ''}`}
                                onClick={() => handleSelectSavedAddress(address)}
                              >
                                {address.full_address}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className={styles.addressFields}>
                          <div className={styles.addressField}>
                            <div className={styles.inputContainer}>
                              <input 
                                type="text" 
                                name="address" 
                                placeholder=" "
                                value={formData.address || formData.pickupAddress}
                                onChange={handleInputChange}
                                className={styles.addressInput}
                                required
                              />
                              <span className={styles.floatingLabel}>
                                Адрес пункта выдачи <span className={styles.requiredStar}>*</span>
                              </span>
                            </div>
                          </div>
                          
                          <div className={styles.inputField}>
                            <div className={styles.inputContainer}>
                              <input 
                                type="text" 
                                name="apartment" 
                                placeholder=" " 
                                value={formData.apartment}
                                onChange={handleInputChange}
                                className={styles.apartmentField}
                              />
                              <span className={styles.floatingLabel}>Квартира</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className={styles.mapContainer}>
                          <YMaps>
                            <Map defaultState={{ center: [43.585472, 39.723098], zoom: 12 }} width="100%" height="300px" onClick={handleMapClick}>
                              <Placemark geometry={[43.585472, 39.723098]} />
                            </Map>
                          </YMaps>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className={styles.formSection}>
                <h2 className={styles.sectionTitle}>Способ оплаты</h2>
                <div className={styles.formContent}>
                  <div className={styles.paymentOptions}>
                    <div className={styles.radioField}>
                      <label className={styles.radioOption}>
                        <input 
                          type="radio" 
                          name="payment" 
                          value="sbp"
                          checked={formData.payment === 'sbp'}
                          onChange={handleRadioChange}
                        />
                        <div className={styles.radioContent}>
                          <span className={styles.radioCircle}></span>
                          <div>
                            <p className={styles.radioTitle}>Оплата через СБП</p>
                            <p className={styles.radioDesc}>Оплата через банковское приложение, не нужно вводить данные карты</p>
                          </div>
                        </div>
                      </label>
                    </div>
                    
                    <div className={styles.radioField}>
                      <label className={styles.radioOption}>
                        <input 
                          type="radio" 
                          name="payment" 
                          value="card"
                          checked={formData.payment === 'card'}
                          onChange={handleRadioChange}
                        />
                        <div className={styles.radioContent}>
                          <span className={styles.radioCircle}></span>
                          <div>
                            <p className={styles.radioTitle}>Оплата картой на сайте</p>
                            <p className={styles.radioDesc}>После подтверждения заказа вы попадете на форму оплаты</p>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className={styles.commentField}>
                <div className={styles.inputContainer}>
                  <textarea 
                    name="comment" 
                    placeholder=" " 
                    value={formData.comment}
                    onChange={handleInputChange}
                  ></textarea>
                  <span className={styles.floatingLabel}>Комментарий к заказу</span>
                </div>
              </div>
              
              <p className={styles.termsText}>
                Делая заказ, Вы даете согласие на обработку персональных данных, принимаете <br />
                <a href="">  правилами пользования</a>,  <a href=""> политику конфиденциальности </a> и <a href=""> договор оферты.</a>
              </p>
            </form>
          )}
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
                        className={`${styles.promoCodeInput} ${promoCodeStatus === 'invalid' ? styles.error : ''} ${promoCodeStatus === 'valid' ? styles.success : ''}`}
                        placeholder=" "
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value);
                          if (promoCodeStatus !== null) {
                            setPromoCodeStatus(null);
                            setPromoCodeError('');
                          }
                        }}
                        disabled={promoCodeStatus === 'loading'}
                      />
                      <span className={styles.floatingLabel}>Введите промокод</span>
                    </div>
                    <button 
                      type="button" 
                      className={`${styles.promoCodeButton} ${promoCodeStatus === 'loading' ? styles.loading : ''}`}
                      onClick={handlePromoCodeSubmit}
                      disabled={promoCodeStatus === 'loading'}
                    >
                      {promoCodeStatus === 'loading' ? 'Проверяем...' : 'Активировать'}
                    </button>
                    {promoCodeError && (
                      <div className={styles.promoCodeError}>
                        {promoCodeError}
                      </div>
                    )}
                    {promoCodeStatus === 'valid' && (
                      <div className={styles.promoCodeSuccess}>
                        Промокод применен! Скидка: {discount.toLocaleString()} ₽
                      </div>
                    )}
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
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
} 