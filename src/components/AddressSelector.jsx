'use client';
import { useState, useEffect, useRef } from 'react';
import YandexMap from './YandexMap';
import styles from './AddressSelector.module.css';

const AddressSelector = ({ 
  onAddressSelect, 
  initialAddress = '',
  showMap = true,
  placeholder = 'Введите адрес или выберите на карте',
  className = '',
  externalAddress = '' // Новый пропс для внешнего адреса
}) => {
  const [address, setAddress] = useState(initialAddress);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const inputRef = useRef(null);
  const timeoutRef = useRef(null);

  // Обновляем адрес при изменении externalAddress
  useEffect(() => {
    if (externalAddress && externalAddress !== address) {
      setAddress(externalAddress);
    }
  }, [externalAddress]);

  // Автодополнение адресов через Яндекс.Карты
  const getAddressSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    
    try {
      if (window.ymaps) {
        const geocoder = window.ymaps.geocode(query, {
          results: 5,
          boundedBy: [[43.0, 39.0], [44.0, 40.0]], // Ограничиваем поиск Сочи и окрестностями
          strictBounds: false
        });

        geocoder.then((res) => {
          const suggestions = res.geoObjects.toArray().map((geoObject) => {
            const address = geoObject.getAddressLine();
            const coords = geoObject.geometry.getCoordinates();
            const components = geoObject.properties.get('metaDataProperty')?.GeocoderMetaData?.Address?.Components || [];
            
            let region = '';
            let city = '';
            let street = '';
            let house = '';
            
            components.forEach(component => {
              switch (component.kind) {
                case 'administrative_area_level_1':
                  region = component.name;
                  break;
                case 'locality':
                  city = component.name;
                  break;
                case 'route':
                  street = component.name;
                  break;
                case 'street_number':
                  house = component.name;
                  break;
              }
            });

            return {
              address,
              coordinates: coords,
              region,
              city,
              street,
              house,
              components
            };
          });
          
          setSuggestions(suggestions);
          setIsLoading(false);
        }).catch((error) => {
          console.error('Ошибка геокодирования:', error);
          setSuggestions([]);
          setIsLoading(false);
        });
      }
    } catch (error) {
      console.error('Ошибка при получении предложений:', error);
      setSuggestions([]);
      setIsLoading(false);
    }
  };

  // Обработка изменения ввода
  const handleInputChange = (e) => {
    const value = e.target.value;
    setAddress(value);
    
    // Очищаем предыдущий таймаут
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Устанавливаем новый таймаут для поиска
    timeoutRef.current = setTimeout(() => {
      getAddressSuggestions(value);
    }, 300);
    
    setShowSuggestions(true);
  };

  // Обработка выбора предложения
  const handleSuggestionSelect = (suggestion) => {
    setAddress(suggestion.address);
    setSelectedLocation(suggestion);
    setShowSuggestions(false);
    
    if (onAddressSelect) {
      onAddressSelect(suggestion);
    }
  };

  // Обработка выбора локации на карте
  const handleMapLocationSelect = (locationData) => {
    setAddress(locationData.address);
    setSelectedLocation(locationData);
    setShowMapModal(false);
    
    if (onAddressSelect) {
      onAddressSelect(locationData);
    }
  };

  // Обработка фокуса на поле ввода
  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Обработка клика вне компонента
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Очистка таймаута при размонтировании
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div 
      className={`${styles.addressSelector} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.inputContainer} ref={inputRef}>
        <input
          type="text"
          value={address}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className={styles.addressInput}
        />
        
        {isLoading && (
          <div className={styles.loadingIndicator}>
            <div className={styles.spinner}></div>
          </div>
        )}
        
        {showMap && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMapModal(true);
            }}
            className={styles.mapButton}
            title="Выбрать на карте"
          >
            
          </button>
        )}
        
        {showSuggestions && suggestions.length > 0 && (
          <div className={styles.suggestions}>
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={styles.suggestion}
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className={styles.suggestionAddress}>
                  {suggestion.address}
                </div>
                {suggestion.city && (
                  <div className={styles.suggestionDetails}>
                    {suggestion.city}
                    {suggestion.region && `, ${suggestion.region}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {showMapModal && (
        <div className={styles.mapModal}>
          <div className={styles.mapModalContent}>
            <div className={styles.mapModalHeader}>
              <h3>Выберите адрес на карте</h3>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMapModal(false);
                }}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            
            <YandexMap
              onLocationSelect={handleMapLocationSelect}
              initialCenter={selectedLocation?.coordinates || [43.585472, 39.723098]}
              initialZoom={15}
              height="400px"
              showGeolocation={true}
              showSearch={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
