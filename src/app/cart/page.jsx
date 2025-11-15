'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IMaskInput } from 'react-imask';
import styles from './page.module.css';
import { useCart } from '../components/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import YandexMap from '../../components/YandexMap';
import AddressSelector from '../../components/AddressSelector';
import AuthModal from '../../components/AuthModal';

export default function CartPage() {
  const { cartItems, removeFromCart, removeAllFromCart, updateQuantity, clearCart } = useCart();
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
  const [mapSelectedAddress, setMapSelectedAddress] = useState('');
  const [documentsUrls, setDocumentsUrls] = useState({
    terms: '#',
    privacy: '#',
    offer: '#'
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    patronymic: '',
    inn: '',
    phone: '',
    email: '',
    region: 'Московская область',
    city: 'Москва',
    street: '',
    house: '',
    postalCode: '',
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
  const [isSavedAddressesDropdownOpen, setIsSavedAddressesDropdownOpen] = useState(false);
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedSavedAddress, setSelectedSavedAddress] = useState('');
  const [pickupAddresses, setPickupAddresses] = useState([
    'ул. Кипарисовая, 56',
    'ул. Морская, 24',
    'ул. Морская, 24',
    'ул. Морская, 24',
    'ул. Морская, 24',
    'ул. Приморская, 118'
  ]);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const [termsRes, privacyRes, offerRes] = await Promise.all([
          fetch('https://aldalinde.ru/api/documents?type=public_offer'),
          fetch('https://aldalinde.ru/api/documents?type=privacy_policy'),
          fetch('https://aldalinde.ru/api/documents?type=public_offer')
        ]);

        const termsData = termsRes.ok ? await termsRes.json() : null;
        const privacyData = privacyRes.ok ? await privacyRes.json() : null;
        const offerData = offerRes.ok ? await offerRes.json() : null;

        const getFullUrl = (url) => {
          if (!url) return '#';
          return url.startsWith('http') ? url : `https://aldalinde.ru${url}`;
        };

        setDocumentsUrls({
          terms: getFullUrl(termsData?.url),
          privacy: getFullUrl(privacyData?.url),
          offer: getFullUrl(offerData?.url)
        });
      } catch (error) {
      }
    };
    fetchDocuments();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [cartItems, discount]);

  useEffect(() => {
    const loadAutocompleteData = async () => {
      if (isAuthenticated) {
        setIsLoadingAutocomplete(true);
        try {
          const response = await fetch('https://aldalinde.ru/api/order/autocomplete/', {
            headers: getAuthHeaders(),
          });
          
          
          if (response.ok) {
            const data = await response.json();
            setAutocompleteData(data);
            
            if (data.pickup_addresses && data.pickup_addresses.length > 0) {
              const pickupAddressesList = data.pickup_addresses.map(address => address.full_address);
              setPickupAddresses(pickupAddressesList);
            }
            
            if (data.profile_fields) {
              setFormData(prev => {
                const newData = {
                  ...prev,
                  firstName: data.profile_fields.first_name || prev.firstName,
                  lastName: data.profile_fields.last_name || prev.lastName,
                  patronymic: data.profile_fields.patronymic || prev.patronymic,
                  phone: data.profile_fields.phone || prev.phone,
                  email: data.emails?.[0] || prev.email,
                };
                return newData;
              });
              
              // Очищаем ошибки валидации при загрузке данных
              setValidationErrors({});
            } else {
            }
          } else {
          }
        } catch (error) {
          console.error('Ошибка при загрузке данных автодополнения:', error);
        } finally {
          setIsLoadingAutocomplete(false);
        }
      } else {
      }
    };

    loadAutocompleteData();
  }, [isAuthenticated, getAuthHeaders]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSavedAddressesDropdownOpen && !event.target.closest(`.${styles.customSelect}`)) {
        setIsSavedAddressesDropdownOpen(false);
      }
      if (isPickupDropdownOpen && !event.target.closest(`.${styles.customSelect}`)) {
        setIsPickupDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSavedAddressesDropdownOpen, isPickupDropdownOpen]);

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
  
  const validateField = (name, value) => {
    const errors = {};
    
    // Не валидируем пустые поля, если они не обязательны
    if (!value.trim()) {
      switch (name) {
        case 'firstName':
        case 'lastName':
        case 'patronymic':
        case 'email':
        case 'city':
          errors[name] = `${name === 'firstName' ? 'Имя' : 
                          name === 'lastName' ? 'Фамилия' : 
                          name === 'patronymic' ? 'Отчество' : 
                          name === 'email' ? 'Email' : 
                          'Населенный пункт'} обязательно для заполнения`;
          break;
        case 'inn':
          if (formData.isLegalEntity) {
            errors.inn = 'ИНН обязателен для заполнения';
          }
          break;
      }
      return errors;
    }
    
    switch (name) {
      case 'firstName':
        if (value.trim().length < 2) {
          errors.firstName = 'Имя должно содержать минимум 2 символа';
        } else if (!/^[а-яёa-z\s-]+$/i.test(value.trim())) {
          errors.firstName = 'Имя может содержать только буквы, пробелы и дефисы';
        }
        break;
        
      case 'lastName':
        if (value.trim().length < 2) {
          errors.lastName = 'Фамилия должна содержать минимум 2 символа';
        } else if (!/^[а-яёa-z\s-]+$/i.test(value.trim())) {
          errors.lastName = 'Фамилия может содержать только буквы, пробелы и дефисы';
        }
        break;
        
      case 'patronymic':
        if (value.trim().length < 2) {
          errors.patronymic = 'Отчество должно содержать минимум 2 символа';
        } else if (!/^[а-яёa-z\s-]+$/i.test(value.trim())) {
          errors.patronymic = 'Отчество может содержать только буквы, пробелы и дефисы';
        }
        break;
        
      case 'email':
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) {
          errors.email = 'Введите корректный email адрес';
        }
        break;
        
      case 'inn':
        if (value.trim()) {
          const innValue = value.replace(/\D/g, '');
          if (innValue.length !== 10 && innValue.length !== 12) {
            errors.inn = 'ИНН должен содержать 10 или 12 цифр';
          }
        }
        break;
        
      case 'city':
        // Город уже проверен выше в блоке пустых полей
        break;
        
      case 'street':
        if (formData.delivery === 'address' && !value.trim()) {
          errors.street = 'Улица обязательна для заполнения';
        }
        break;
        
      case 'house':
        if (formData.delivery === 'address' && !value.trim()) {
          errors.house = 'Номер дома обязателен для заполнения';
        }
        break;
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Обрабатываем специальные поля
    let processedValue = value;
    if (name === 'inn') {
      processedValue = value.replace(/\D/g, '');
    } else if (name === 'phone') {
      // Маска сама форматирует, просто убираем лишние символы
      processedValue = value;
    } else if (['firstName', 'lastName', 'patronymic'].includes(name)) {
      // Разрешаем только буквы, пробелы и дефисы для ФИО
      processedValue = value.replace(/[^а-яёa-z\s-]/gi, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));

    // Валидируем только при реальном изменении пользователем
    const fieldErrors = validateField(name, processedValue);
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      // Очищаем ошибку для этого поля, если валидация прошла успешно
      if (!fieldErrors[name]) {
        delete newErrors[name];
      } else {
        newErrors[name] = fieldErrors[name];
      }
      return newErrors;
    });

    if (name === 'inn' && formData.isLegalEntity) {
      const innValue = processedValue.replace(/\D/g, '');
      
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

    // Очищаем ошибки валидации для полей адреса при смене типа доставки
    if (name === 'delivery') {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.street;
        delete newErrors.house;
        return newErrors;
      });
    }
  };
  
  const handleToggleChange = (name) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));

    // Очищаем ошибки валидации для ИНН при переключении юридического лица
    if (name === 'isLegalEntity') {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.inn;
        return newErrors;
      });
    }
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
      
      const response = await fetch('https://aldalinde.ru/api/order/check-promo/', {
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
  
  const validateForm = () => {
    const errors = {};
    
    const fieldsToValidate = ['firstName', 'lastName', 'patronymic', 'email', 'city'];
    
    if (formData.isLegalEntity) {
      fieldsToValidate.push('inn');
    }
    
    if (formData.delivery === 'address') {
      fieldsToValidate.push('street', 'house');
    }
    
    fieldsToValidate.forEach(field => {
      const fieldErrors = validateField(field, formData[field]);
      Object.assign(errors, fieldErrors);
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    
    if (!validateForm()) {
      alert('Пожалуйста, исправьте ошибки в форме');
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
        postal_code: formData.postalCode || '',
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


    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (isAuthenticated) {
        const authHeaders = getAuthHeaders();
        Object.assign(headers, authHeaders);
      }
      
      const response = await fetch('https://aldalinde.ru/api/order/create-order/', {
        method: 'POST',
        headers,
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

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
    const fullAddress = address.full_address || '';
    let coordinates = null;
    
    if (address.coordinates_x && address.coordinates_y) {
      const lat = parseFloat(address.coordinates_y);
      const lon = parseFloat(address.coordinates_x);
      if (!isNaN(lat) && !isNaN(lon)) {
        coordinates = [lat, lon];
      }
    }
    
    setFormData(prev => ({
      ...prev,
      city: address.locality || prev.city,
      street: address.route || prev.street,
      house: address.street_number || prev.house,
      apartment: address.apartment || prev.apartment,
      fullAddress: fullAddress,
      coordinates: coordinates || prev.coordinates
    }));
    setSelectedAddressId(address.id);
    setSelectedSavedAddress(fullAddress);
    setMapSelectedAddress(fullAddress);
    setIsSavedAddressesDropdownOpen(false);
  };

  const handleRemoveClick = (item) => {
    // Удаляем весь товар
    removeFromCart(item.id);
  };



  const handleLocationSelect = (locationData) => {
    
    if (locationData.fullAddress) {
      setMapSelectedAddress(locationData.fullAddress);
    }
    
    setFormData(prev => ({
      ...prev,
      region: locationData.region || prev.region,
      city: locationData.city || prev.city,
      street: locationData.street || prev.street,
      house: locationData.house || prev.house,
      postalCode: locationData.postal_code || prev.postalCode,
      coordinates: locationData.coordinates,
      fullAddress: locationData.fullAddress || locationData.address
    }));

    if (locationData.street) {
      const streetErrors = validateField('street', locationData.street);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        if (!streetErrors.street) {
          delete newErrors.street;
        } else {
          newErrors.street = streetErrors.street;
        }
        return newErrors;
      });
    }
    if (locationData.house) {
      const houseErrors = validateField('house', locationData.house);
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        if (!houseErrors.house) {
          delete newErrors.house;
        } else {
          newErrors.house = houseErrors.house;
        }
        return newErrors;
      });
    }
  };


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
                  
                </div>
                
                <div className={styles.itemContent}>
                  <Link href={`/product/${item.id}`} className={styles.productNameLink}>
                    <h3 className={styles.productName}>{item.name}</h3>
                  </Link>
                  <p className={styles.productArticle}>Артикул: {item.article}</p>
                  
                  <div className={styles.productDetails}>
                    <div className={styles.colorMaterial}>
                      <span>Цвет: {item.color || 'Не указан'}</span>
                      <span className={styles.detailDivider}></span>
                      <span>Размер: {item.dimensions || 'Не указаны'}</span>
                    </div>
                    
                    <div className={styles.quantityPrice}>
                      <div className={styles.quantityControls}>
                        <div className={styles.quantityButtons}>
                          <button 
                            type="button"
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
            <>
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
                          className={validationErrors.firstName ? styles.errorInput : ''}
                        />
                        <span className={styles.floatingLabel}>
                          Имя <span className={styles.requiredStar}>*</span>
                        </span>
                        {validationErrors.firstName && (
                          <span className={styles.errorMessage}>{validationErrors.firstName}</span>
                        )}
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
                          className={validationErrors.lastName ? styles.errorInput : ''}
                        />
                        <span className={styles.floatingLabel}>
                          Фамилия <span className={styles.requiredStar}>*</span>
                        </span>
                        {validationErrors.lastName && (
                          <span className={styles.errorMessage}>{validationErrors.lastName}</span>
                        )}
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
                          className={validationErrors.patronymic ? styles.errorInput : ''}
                        />
                        <span className={styles.floatingLabel}>
                          Отчество <span className={styles.requiredStar}>*</span>
                        </span>
                        {validationErrors.patronymic && (
                          <span className={styles.errorMessage}>{validationErrors.patronymic}</span>
                        )}
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
                  
                  {formData.isLegalEntity && (
                    <div className={styles.formRow}>
                      <div className={styles.inputField}>
                        <div className={styles.inputContainer}>
                          <input 
                            type="text" 
                            name="inn" 
                            placeholder=" " 
                            value={formData.inn}
                            onChange={handleInputChange}
                            className={validationErrors.inn ? styles.errorInput : ''}
                          />
                          <span className={styles.floatingLabel}>
                            Укажите ИНН ИП или организацию <span className={styles.requiredStar}>*</span>
                          </span>
                          {validationErrors.inn && (
                            <span className={styles.errorMessage}>{validationErrors.inn}</span>
                          )}
                        </div>
                      </div>
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
                        <IMaskInput
                          mask="+7 (000) 000-00-00"
                          type="tel" 
                          name="phone" 
                          placeholder=" " 
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={validationErrors.phone ? styles.errorInput : ''}
                        />
                        <span className={styles.floatingLabel}>
                          Телефон   
                        </span>
                        {validationErrors.phone && (
                          <span className={styles.errorMessage}>{validationErrors.phone}</span>
                        )}
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
                          className={validationErrors.email ? styles.errorInput : ''}
                        />
                        <span className={styles.floatingLabel}>
                          Электронная почта <span className={styles.requiredStar}>*</span>
                        </span>
                        {validationErrors.email && (
                          <span className={styles.errorMessage}>{validationErrors.email}</span>
                        )}
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
                        className={`${styles.cityField} ${validationErrors.city ? styles.errorInput : ''}`}
                      />
                      <span className={styles.floatingLabel}>Населенный пункт <span className={styles.requiredStar}>*</span></span>
                      {validationErrors.city && (
                        <span className={styles.errorMessage}>{validationErrors.city}</span>
                      )}
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
                          <div className={styles.addressField}>
                            <div className={styles.customSelect}>
                              <div 
                                className={styles.selectHeader} 
                                onClick={() => setIsSavedAddressesDropdownOpen(!isSavedAddressesDropdownOpen)}
                              >
                                <div className={styles.inputContainer}>
                                  <input 
                                    type="text" 
                                    name="savedAddress" 
                                    placeholder=" "
                                    value={selectedSavedAddress || 'Выберите сохраненный адрес'}
                                    onChange={() => {}}
                                    className={styles.pickupAddressField}
                                    readOnly
                                  />
                                  <span className={styles.floatingLabel}>
                                    Сохраненные адреса
                                  </span>
                                </div>
                                <div className={styles.selectArrow}>
                                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 1L7 7L13 1" stroke="#C1AF86" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </div>
                              </div>
                              
                              {isSavedAddressesDropdownOpen && (
                                <div className={styles.selectOptions}>
                                  {autocompleteData.delivery_addresses.map((address, index) => (
                                    <div 
                                      key={`delivery-${address.id}-${index}`} 
                                      className={`${styles.selectOption} ${selectedAddressId === address.id ? styles.selected : ''}`}
                                      onClick={() => handleSelectSavedAddress(address)}
                                    >
                                      {address.full_address}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        <div className={styles.addressFields}>
                          <div className={styles.addressField}>
                            <AddressSelector
                              onAddressSelect={handleLocationSelect}
                              initialAddress={formData.fullAddress || ''}
                              externalAddress={mapSelectedAddress}
                              placeholder="Введите адрес доставки"
                              showMap={false}
                              className={styles.addressSelector}
                            />
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
                        
                        <YandexMap
                          onLocationSelect={handleLocationSelect}
                          initialCenter={formData.coordinates || [55.751574, 37.573856]}
                          height="400px"
                          selectedCoordinates={formData.coordinates}
                          selectedAddress={formData.fullAddress}
                        />
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
                <a href={documentsUrls.terms} target="_blank" rel="noopener noreferrer">правилами пользования</a>,  <a href={documentsUrls.privacy} target="_blank" rel="noopener noreferrer">политику конфиденциальности</a> и <a href={documentsUrls.offer} target="_blank" rel="noopener noreferrer">договор оферты.</a>
              </p>
            </form>
            
            </>
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