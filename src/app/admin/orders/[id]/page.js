'use client';

import { useState, useEffect, use, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../contexts/AuthContext';
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
  const [addressObj, setAddressObj] = useState(null);
  const [isPickup, setIsPickup] = useState(false);
  const [availablePickupAddresses, setAvailablePickupAddresses] = useState([]);
  const [selectedPickupAddress, setSelectedPickupAddress] = useState(null);
  const [isDeliveryTypeDropdownOpen, setIsDeliveryTypeDropdownOpen] = useState(false);
  const [isPickupAddressDropdownOpen, setIsPickupAddressDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const deliveryTypeRef = useRef(null);
  const pickupAddressRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deliveryTypeRef.current && !deliveryTypeRef.current.contains(event.target)) {
        setIsDeliveryTypeDropdownOpen(false);
      }
      if (pickupAddressRef.current && !pickupAddressRef.current.contains(event.target)) {
        setIsPickupAddressDropdownOpen(false);
      }
      if (statusRef.current && !statusRef.current.contains(event.target)) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const [deliveryAddress, setDeliveryAddress] = useState({
    administrative_area: '',
    locality: '',
    route: '',
    street_number: '',
    postal_code: '',
    entrance: '',
    floor: '',
    apartment: ''
  });
  const [deliveryCoordinates, setDeliveryCoordinates] = useState(null);
  const mapContainerRef = useRef(null);
  const adminMapRef = useRef(null);
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
  const [showAddressFields, setShowAddressFields] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDateFromInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return price.toLocaleString('ru-RU');
  };

  const AdminOrderMap = ({ center, address, deliveryAddress }) => {
    const mapRef = useRef(null);
    const containerRef = useRef(null);
    const placemarkRef = useRef(null);
    const apiKey = 'aa9feae8-022d-44d2-acb1-8cc0198f451d';

    useEffect(() => {
      if (!containerRef.current) return;

      const initMap = () => {
        if (!window.ymaps) return;

        window.ymaps.ready(() => {
          if (!containerRef.current) return;

          if (!mapRef.current) {
            mapRef.current = new window.ymaps.Map(containerRef.current, {
              center: center || [55.751574, 37.573856],
              zoom: 15
            });
          }

          if (placemarkRef.current) {
            mapRef.current.geoObjects.remove(placemarkRef.current);
          }

          placemarkRef.current = new window.ymaps.Placemark(center || [55.751574, 37.573856], {
            balloonContent: address || 'Адрес доставки'
          }, {
            preset: 'islands#redDotIcon'
          });

          mapRef.current.geoObjects.add(placemarkRef.current);
          
          if (center) {
            mapRef.current.setCenter(center);
          }
        });
      };

      if (window.ymaps && window.ymaps.ready) {
        initMap();
      } else {
        const script = document.createElement('script');
        script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
        script.async = true;

        script.onload = () => {
          if (window.ymaps && window.ymaps.ready) {
            initMap();
          }
        };

        if (!document.querySelector(`script[src*="api-maps.yandex.ru/2.1"]`)) {
          document.head.appendChild(script);
        } else {
          initMap();
        }

        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      }

      return () => {
        if (mapRef.current && mapRef.current.destroy) {
          mapRef.current.destroy();
          mapRef.current = null;
        }
        placemarkRef.current = null;
      };
    }, [center, address]);

    useEffect(() => {
      if (deliveryAddress && mapRef.current) {
        const addressString = [
          deliveryAddress.administrative_area,
          deliveryAddress.locality,
          deliveryAddress.route,
          deliveryAddress.street_number
        ].filter(Boolean).join(', ');

        if (addressString.trim().length > 3) {
          const timeoutId = setTimeout(() => {
            geocodeAddress(addressString, (coords) => {
              if (coords && mapRef.current) {
                if (placemarkRef.current) {
                  mapRef.current.geoObjects.remove(placemarkRef.current);
                }
                
                placemarkRef.current = new window.ymaps.Placemark(coords, {
                  balloonContent: addressString
                }, {
                  preset: 'islands#redDotIcon'
                });
                
                mapRef.current.geoObjects.add(placemarkRef.current);
                mapRef.current.setCenter(coords);
              }
            });
          }, 500);

          return () => clearTimeout(timeoutId);
        }
      }
    }, [deliveryAddress]);

    return (
      <div className={styles.formGroup}>
        <label>Адрес доставки на карте:</label>
        <div 
          ref={containerRef}
          style={{ width: '100%', height: '250px', borderRadius: '8px', overflow: 'hidden' }}
        />
      </div>
    );
  };

  const geocodeAddress = async (addressString, setCoordinates) => {
    if (!addressString || addressString.trim().length < 3) return;
    
    try {
      const apiKey = 'aa9feae8-022d-44d2-acb1-8cc0198f451d';
      const url = `https://geocode-maps.yandex.ru/v1/?apikey=${apiKey}&geocode=${encodeURIComponent(addressString)}&format=json&results=1&lang=ru_RU`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject) {
        const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
        const coords = geoObject.Point.pos.split(' ').map(Number).reverse();
        if (coords.length === 2) {
          setCoordinates(coords);
        }
      }
    } catch (error) {
      console.error('Ошибка геокодирования адреса:', error);
    }
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
      console.log('📥 Данные заказа из API:', data);
      console.log('📥 data.address:', data.address);
      console.log('📥 data.delivery_address:', data.delivery_address);
      console.log('📥 data.delivery_type:', data.delivery_type);
      console.log('📥 data.pickup:', data.pickup);
      
      setOrder(data);
      setStatus(data.status || '');
      setComment(data.comment || '');
      
      if (data.available_pickup_addresses && Array.isArray(data.available_pickup_addresses)) {
        setAvailablePickupAddresses(data.available_pickup_addresses);
      }
      
      const isPickupDelivery = data.pickup !== undefined 
        ? data.pickup 
        : (data.delivery_type === 'pickup');
      
      console.log('🔍 isPickupDelivery:', isPickupDelivery);
      
      setIsPickup(isPickupDelivery);
      
      if (data.address) {
        if (typeof data.address === 'string') {
          setAddress(data.address);
          setAddressObj(null);
        } else if (typeof data.address === 'object') {
          if (isPickupDelivery && data.address.id) {
            console.log('📦 Самовывоз - адрес с id:', data.address);
            setAddressObj(data.address);
            setAddress(data.address.full_address || '');
            setSelectedPickupAddress(data.address);
          } else if (!isPickupDelivery && (data.address.route || data.address.locality || data.address.full_address || data.address.administrative_area)) {
            console.log('✅ Адрес доставки найден в data.address:', data.address);
            const deliveryAddr = {
              administrative_area: data.address.administrative_area || '',
              locality: data.address.locality || '',
              route: data.address.route || '',
              street_number: data.address.street_number || '',
              postal_code: data.address.postal_code || '',
              entrance: data.address.entrance || '',
              floor: data.address.floor || '',
              apartment: data.address.apartment || ''
            };
            console.log('✅ Устанавливаем deliveryAddress:', deliveryAddr);
            setAddress(data.address.full_address || '');
            
            if (data.address.coordinates_x && data.address.coordinates_y) {
              setDeliveryCoordinates([data.address.coordinates_y, data.address.coordinates_x]);
              setAddressObj({
                ...data.address,
                coordinates_y: data.address.coordinates_y,
                coordinates_x: data.address.coordinates_x
              });
            } else if (data.address.coordinates && Array.isArray(data.address.coordinates) && data.address.coordinates.length === 2) {
              setDeliveryCoordinates(data.address.coordinates);
              setAddressObj({
                ...data.address,
                coordinates_y: data.address.coordinates[0],
                coordinates_x: data.address.coordinates[1]
              });
            } else {
              setAddressObj(data.address);
              if (data.address.full_address || (data.address.route && data.address.street_number)) {
                const addressString = data.address.full_address || 
                  `${data.address.administrative_area || ''}, ${data.address.locality || ''}, ${data.address.route || ''}, ${data.address.street_number || ''}`.trim();
                geocodeAddress(addressString, setDeliveryCoordinates);
              }
            }
            
            setDeliveryAddress(deliveryAddr);
          } else {
            setAddress('');
            setAddressObj(null);
          }
        } else {
          setAddress('');
          setAddressObj(null);
        }
      } else {
        setAddress('');
        setAddressObj(null);
      }
      
      if (data.delivery_address && typeof data.delivery_address === 'object') {
        setDeliveryAddress({
          administrative_area: data.delivery_address.administrative_area || '',
          locality: data.delivery_address.locality || '',
          route: data.delivery_address.route || '',
          street_number: data.delivery_address.street_number || '',
          postal_code: data.delivery_address.postal_code || '',
          entrance: data.delivery_address.entrance || '',
          floor: data.delivery_address.floor || '',
          apartment: data.delivery_address.apartment || ''
        });
        
        if (data.delivery_address.coordinates_x && data.delivery_address.coordinates_y) {
          setDeliveryCoordinates([data.delivery_address.coordinates_y, data.delivery_address.coordinates_x]);
        } else if (data.delivery_address.coordinates && Array.isArray(data.delivery_address.coordinates) && data.delivery_address.coordinates.length === 2) {
          setDeliveryCoordinates(data.delivery_address.coordinates);
        } else {
          const addressString = data.delivery_address.full_address || 
            `${data.delivery_address.administrative_area || ''}, ${data.delivery_address.locality || ''}, ${data.delivery_address.route || ''}, ${data.delivery_address.street_number || ''}`.trim();
          if (addressString) {
            geocodeAddress(addressString, setDeliveryCoordinates);
          }
        }
      } else if (data.address && typeof data.address === 'object' && !data.address.id && (data.address.route || data.address.locality || data.address.administrative_area)) {
        console.log('✅ Адрес доставки найден в data.address (else if):', data.address);
        const deliveryAddr = {
          administrative_area: data.address.administrative_area || '',
          locality: data.address.locality || '',
          route: data.address.route || '',
          street_number: data.address.street_number || '',
          postal_code: data.address.postal_code || '',
          entrance: data.address.entrance || '',
          floor: data.address.floor || '',
          apartment: data.address.apartment || ''
        };
        console.log('✅ Устанавливаем deliveryAddress (else if):', deliveryAddr);
        setDeliveryAddress(deliveryAddr);
        
        if (data.address.coordinates_x && data.address.coordinates_y) {
          setDeliveryCoordinates([data.address.coordinates_y, data.address.coordinates_x]);
        } else if (data.address.coordinates && Array.isArray(data.address.coordinates) && data.address.coordinates.length === 2) {
          setDeliveryCoordinates(data.address.coordinates);
        } else if (data.address.full_address || (data.address.route && data.address.street_number)) {
          const addressString = data.address.full_address || 
            `${data.address.administrative_area || ''}, ${data.address.locality || ''}, ${data.address.route || ''}, ${data.address.street_number || ''}`.trim();
          geocodeAddress(addressString, setDeliveryCoordinates);
        }
      }
      
      const initialQuantities = {};
      if (data.products && Array.isArray(data.products)) {
        data.products.forEach(product => {
          initialQuantities[product.id] = product.quantity || 1;
        });
      }
      setProductQuantities(initialQuantities);
      
      setTimeout(() => {
        console.log('📋 После установки - deliveryAddress:', deliveryAddress);
        console.log('📋 После установки - address:', address);
        console.log('📋 После установки - isPickup:', isPickup);
      }, 100);
      
      if (isManager) {
        setClientFirstName(data.client_first_name || '');
        setClientLastName(data.client_last_name || '');
        setClientPatronymic(data.client_patronymic || '');
        setPhone(data.phone || '');
        setEmail(data.email || '');
        setInn(data.inn || '');
        setIsProcessed(data.is_processed || false);
        if (data.order_date) {
          setDeliveryDate(formatDateForInput(data.order_date));
        }
      } else {
        if (data.received_date) {
          setDeliveryDate(formatDateForInput(data.received_date));
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
        const oldPickup = order.pickup !== undefined ? order.pickup : (order.address && typeof order.address === 'object' && order.address.id);
        const pickupChanged = isPickup !== oldPickup;
        
        if (pickupChanged) {
          updateData.pickup = isPickup;
          if (isPickup) {
            if (selectedPickupAddress && selectedPickupAddress.id) {
              updateData.address = { id: selectedPickupAddress.id };
            }
          } else {
            updateData.delivery_address = deliveryAddress;
          }
        } else {
          if (isPickup) {
            if (selectedPickupAddress && selectedPickupAddress.id !== (order.address?.id || addressObj?.id)) {
              updateData.address = { id: selectedPickupAddress.id };
            }
          } else {
            const oldDeliveryAddress = order.delivery_address || {};
            const deliveryChanged = 
              deliveryAddress.administrative_area !== (oldDeliveryAddress.administrative_area || '') ||
              deliveryAddress.locality !== (oldDeliveryAddress.locality || '') ||
              deliveryAddress.route !== (oldDeliveryAddress.route || '') ||
              deliveryAddress.street_number !== (oldDeliveryAddress.street_number || '') ||
              deliveryAddress.postal_code !== (oldDeliveryAddress.postal_code || '') ||
              deliveryAddress.entrance !== (oldDeliveryAddress.entrance || '') ||
              deliveryAddress.floor !== (oldDeliveryAddress.floor || '') ||
              deliveryAddress.apartment !== (oldDeliveryAddress.apartment || '');
            
            if (deliveryChanged) {
              updateData.delivery_address = deliveryAddress;
            }
          }
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
        setComment(data.order.comment || '');
        
        if (data.order.available_pickup_addresses && Array.isArray(data.order.available_pickup_addresses)) {
          setAvailablePickupAddresses(data.order.available_pickup_addresses);
        }
        
        if (data.order.address) {
          if (typeof data.order.address === 'string') {
            setAddress(data.order.address);
            setAddressObj(null);
            setIsPickup(false);
          } else if (typeof data.order.address === 'object' && data.order.address.id) {
            setAddressObj(data.order.address);
            setAddress(data.order.address.full_address || '');
            setIsPickup(true);
            setSelectedPickupAddress(data.order.address);
          } else if (typeof data.order.address === 'object' && (data.order.address.route || data.order.address.locality || data.order.address.full_address)) {
            setAddress(data.order.address.full_address || '');
            setAddressObj(data.order.address);
            setIsPickup(false);
            setDeliveryAddress({
              administrative_area: data.order.address.administrative_area || '',
              locality: data.order.address.locality || '',
              route: data.order.address.route || '',
              street_number: data.order.address.street_number || '',
              postal_code: data.order.address.postal_code || '',
              entrance: data.order.address.entrance || '',
              floor: data.order.address.floor || '',
              apartment: data.order.address.apartment || ''
            });
          }
        }
        
        if (data.order.pickup !== undefined) {
          setIsPickup(data.order.pickup);
        } else if (data.order.delivery_type === 'pickup') {
          setIsPickup(true);
        } else if (data.order.delivery_type === 'delivery') {
          setIsPickup(false);
        }
        
        if (data.order.delivery_address && typeof data.order.delivery_address === 'object') {
          setDeliveryAddress({
            administrative_area: data.order.delivery_address.administrative_area || '',
            locality: data.order.delivery_address.locality || '',
            route: data.order.delivery_address.route || '',
            street_number: data.order.delivery_address.street_number || '',
            postal_code: data.order.delivery_address.postal_code || '',
            entrance: data.order.delivery_address.entrance || '',
            floor: data.order.delivery_address.floor || '',
            apartment: data.order.delivery_address.apartment || ''
          });
        } else if (data.order.address && typeof data.order.address === 'object' && !data.order.address.id && (data.order.address.route || data.order.address.locality || data.order.address.administrative_area)) {
          setDeliveryAddress({
            administrative_area: data.order.address.administrative_area || '',
            locality: data.order.address.locality || '',
            route: data.order.address.route || '',
            street_number: data.order.address.street_number || '',
            postal_code: data.order.address.postal_code || '',
            entrance: data.order.address.entrance || '',
            floor: data.order.address.floor || '',
            apartment: data.order.address.apartment || ''
          });
        }
        
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
          {isManager && (
            <div className={styles.formGroup}>
              <label>Тип доставки:</label>
              <div className={styles.customSelect} ref={deliveryTypeRef}>
                <div 
                  className={styles.selectHeader} 
                  onClick={() => setIsDeliveryTypeDropdownOpen(!isDeliveryTypeDropdownOpen)}
                >
                  <div className={styles.inputContainer}>
                    <input 
                      type="text" 
                      placeholder=" "
                      value={isPickup ? 'Самовывоз' : 'Доставка'}
                      readOnly
                      className={styles.selectInput}
                    />
                  
                  </div>
                  <div className={styles.selectArrow}>
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L7 7L13 1" stroke="#C1AF86" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                {isDeliveryTypeDropdownOpen && (
                  <div className={styles.selectOptions}>
                    <div 
                      className={styles.selectOption}
                      onClick={() => {
                        setIsPickup(false);
                        setIsDeliveryTypeDropdownOpen(false);
                        setSelectedPickupAddress(null);
                        setAddressObj(null);
                        setAddress('');
                      }}
                    >
                      Доставка
                    </div>
                    <div 
                      className={styles.selectOption}
                      onClick={() => {
                        setIsPickup(true);
                        setIsDeliveryTypeDropdownOpen(false);
                        setDeliveryAddress({
                          administrative_area: '',
                          locality: '',
                          route: '',
                          street_number: '',
                          postal_code: '',
                          entrance: '',
                          floor: '',
                          apartment: ''
                        });
                      }}
                    >
                      Самовывоз
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {isManager && isPickup && availablePickupAddresses.length > 0 && (
            <div className={styles.formGroup}>
              <label>Адрес самовывоза:</label>
              <div className={styles.customSelect} ref={pickupAddressRef}>
                <div 
                  className={styles.selectHeader} 
                  onClick={() => setIsPickupAddressDropdownOpen(!isPickupAddressDropdownOpen)}
                >
                  <div className={styles.inputContainer}>
                    <input 
                      type="text" 
                      placeholder=" "
                      value={selectedPickupAddress?.full_address || selectedPickupAddress ? `${selectedPickupAddress.administrative_area}, ${selectedPickupAddress.locality}, ${selectedPickupAddress.route} ${selectedPickupAddress.street_number}` : ''}
                      readOnly
                      className={styles.selectInput}
                    />
                   
                  </div>
                  <div className={styles.selectArrow}>
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L7 7L13 1" stroke="#C1AF86" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                
                {isPickupAddressDropdownOpen && (
                  <div className={styles.selectOptions}>
                    {availablePickupAddresses.map(addr => (
                      <div 
                        key={addr.id}
                        className={styles.selectOption}
                        onClick={() => {
                          setSelectedPickupAddress(addr);
                          setAddress(addr.full_address || '');
                          setAddressObj(addr);
                          setIsPickupAddressDropdownOpen(false);
                        }}
                      >
                        {addr.full_address || `${addr.administrative_area}, ${addr.locality}, ${addr.route} ${addr.street_number}`}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {isManager && !isPickup && (
            <>
              <div className={styles.formGroup}>
                <button
                  type="button"
                  onClick={() => setShowAddressFields(!showAddressFields)}
                  className={styles.showAddressButton}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f0f0f0',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {showAddressFields ? 'Скрыть основные поля адреса' : 'Показать основные поля адреса'}
                </button>
              </div>
              
              {showAddressFields && (
                <>
                  <div className={styles.formGroup}>
                    <label>Область:</label>
                    <div className={styles.inputWithIcon}>
                      <input
                        type="text"
                        value={deliveryAddress.administrative_area}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, administrative_area: e.target.value})}
                        placeholder="Московская область"
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Город:</label>
                    <div className={styles.inputWithIcon}>
                      <input
                        type="text"
                        value={deliveryAddress.locality}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, locality: e.target.value})}
                        placeholder="Москва"
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Улица:</label>
                    <div className={styles.inputWithIcon}>
                      <input
                        type="text"
                        value={deliveryAddress.route}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, route: e.target.value})}
                        placeholder="Ленинский проспект"
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Номер дома:</label>
                    <div className={styles.inputWithIcon}>
                      <input
                        type="text"
                        value={deliveryAddress.street_number}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, street_number: e.target.value})}
                        placeholder="10"
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Индекс:</label>
                    <div className={styles.inputWithIcon}>
                      <input
                        type="text"
                        value={deliveryAddress.postal_code}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, postal_code: e.target.value})}
                        placeholder="119049"
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Подъезд:</label>
                    <div className={styles.inputWithIcon}>
                      <input
                        type="text"
                        value={deliveryAddress.entrance}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, entrance: e.target.value})}
                        placeholder="2"
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Этаж:</label>
                    <div className={styles.inputWithIcon}>
                      <input
                        type="text"
                        value={deliveryAddress.floor}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, floor: e.target.value})}
                        placeholder="3"
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Квартира:</label>
                    <div className={styles.inputWithIcon}>
                      <input
                        type="text"
                        value={deliveryAddress.apartment}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, apartment: e.target.value})}
                        placeholder="45"
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          
          {!isManager && (
            <div className={styles.formGroup}>
              <label>Адрес доставки/пункта самовывоза:</label>
              <div className={styles.inputWithIcon}>
                <input
                  type="text"
                  value={address}
                  readOnly
                  className={styles.formInput}
                />
              </div>
            </div>
          )}
          
          <div className={styles.formGroup}>
            <label>Дата доставки/самовывоза:</label>
            <div className={styles.inputWithIcon}>
              <input
                type="date"
                value={deliveryDate || ''}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className={styles.formInput}
                style={{ paddingRight: '50px' }}
              />
              <button 
                className={styles.editButton}
                type="button"
                onClick={() => {
                  const input = document.querySelector(`input[type="date"][value="${deliveryDate || ''}"]`);
                  if (input) {
                    input.showPicker();
                  }
                }}
                style={{ pointerEvents: 'auto', zIndex: 10 }}
              >
              <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M19.09 14.9412V19.3812C19.0898 20.0094 18.8401 20.6118 18.3959 21.0561C17.9516 21.5003 17.3492 21.75 16.721 21.7502H5.12002C4.80777 21.7501 4.49863 21.6883 4.21035 21.5683C3.92208 21.4483 3.66035 21.2726 3.44021 21.0511C3.22007 20.8297 3.04586 20.5669 2.92758 20.2779C2.80931 19.989 2.74931 19.6795 2.75102 19.3672V7.77922C2.74916 7.46747 2.80919 7.15845 2.92764 6.87007C3.04608 6.58169 3.22059 6.31968 3.44103 6.09924C3.66148 5.87879 3.92348 5.70429 4.21186 5.58584C4.50025 5.4674 4.80927 5.40736 5.12102 5.40922H9.56002" stroke="#C1A286" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  <path d="M19.09 9.49521L15.005 5.40921M6.83496 16.3032V14.1382C6.83696 13.7812 6.97896 13.4382 7.22996 13.1852L16.762 3.65321C16.8884 3.52532 17.039 3.42378 17.205 3.35449C17.371 3.28519 17.5491 3.24951 17.729 3.24951C17.9088 3.24951 18.0869 3.28519 18.2529 3.35449C18.4189 3.42378 18.5695 3.52532 18.696 3.65321L20.847 5.80421C20.9749 5.93069 21.0764 6.08128 21.1457 6.24727C21.215 6.41326 21.2507 6.59134 21.2507 6.77121C21.2507 6.95108 21.215 7.12917 21.1457 7.29515C21.0764 7.46114 20.9749 7.61173 20.847 7.73821L11.315 17.2702C11.0615 17.5219 10.7192 17.6638 10.362 17.6652H8.19696C8.01803 17.6655 7.8408 17.6304 7.67544 17.5621C7.51007 17.4937 7.35982 17.3934 7.2333 17.2669C7.10677 17.1404 7.00646 16.9901 6.9381 16.8247C6.86975 16.6594 6.8347 16.4821 6.83496 16.3032Z" stroke="#C1A286" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
</svg>
              </button>
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label>Статус заказа:</label>
            <div className={styles.customSelect} ref={statusRef}>
              <div 
                className={styles.selectHeader} 
                onClick={() => !(!isManager && order.can_change_status === false) && setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                style={{ 
                  cursor: (!isManager && order.can_change_status === false) ? 'not-allowed' : 'pointer',
                  opacity: (!isManager && order.can_change_status === false) ? 0.5 : 1
                }}
              >
                <div className={styles.inputContainer}>
                  <input 
                    type="text" 
                    placeholder=" "
                    value={statusMap[status] || status}
                    readOnly
                    className={styles.selectInput}
                    disabled={!isManager && order.can_change_status === false}
                  />
                 
                </div>
                <div className={styles.selectArrow}>
                  <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L7 7L13 1" stroke="#C1AF86" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              
              {isStatusDropdownOpen && !(!isManager && order.can_change_status === false) && (
                <div className={styles.selectOptions}>
                  {order.available_statuses && order.available_statuses.length > 0 ? (
                    order.available_statuses.map(statusVal => (
                      <div 
                        key={statusVal}
                        className={styles.selectOption}
                        onClick={() => {
                          setStatus(statusVal);
                          setIsStatusDropdownOpen(false);
                        }}
                      >
                        {statusMap[statusVal] || statusVal}
                      </div>
                    ))
                  ) : (
                    Object.entries(statusMap).map(([value, label]) => (
                      <div 
                        key={value}
                        className={styles.selectOption}
                        onClick={() => {
                          setStatus(value);
                          setIsStatusDropdownOpen(false);
                        }}
                      >
                        {label}
                      </div>
                    ))
                  )}
                </div>
              )}
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
          
          {((address || (addressObj && addressObj.full_address)) && (isManager ? (!isPickup || (addressObj && addressObj.coordinates_y && addressObj.coordinates_x)) : true)) && (
            <AdminOrderMap 
              center={(!isPickup && deliveryCoordinates) 
                ? deliveryCoordinates
                : (addressObj && addressObj.coordinates_y && addressObj.coordinates_x) 
                  ? [addressObj.coordinates_y, addressObj.coordinates_x]
                  : [55.751574, 37.573856]}
              address={address || (addressObj && addressObj.full_address) || ''}
              deliveryAddress={isManager && !isPickup ? deliveryAddress : null}
            />
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