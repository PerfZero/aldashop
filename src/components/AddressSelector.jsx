'use client';
import { useState, useEffect, useRef } from 'react';
import SimpleYandexMap from './YandexMap';
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
          boundedBy: [[41.185096, 19.616318], [81.858710, 180.000000]],
          strictBounds: true
        });

        geocoder.then((res) => {
          const suggestions = res.geoObjects.toArray()
            .map((geoObject) => {
              const address = geoObject.getAddressLine();
              const coords = geoObject.geometry.getCoordinates();
              const components = geoObject.properties.get('metaDataProperty')?.GeocoderMetaData?.Address?.Components || [];
              
              let country = '';
              let region = '';
              let city = '';
              let street = '';
              let house = '';
              
              components.forEach(component => {
                switch (component.kind) {
                  case 'country':
                    country = component.name;
                    break;
                  case 'province':
                    if (!component.name.includes('федеральный округ')) {
                      region = component.name;
                    }
                    break;
                  case 'administrative_area_level_1':
                    region = component.name;
                    break;
                  case 'locality':
                    city = component.name;
                    break;
                  case 'route':
                    street = component.name;
                    break;
                  case 'street':
                    street = component.name;
                    break;
                  case 'street_number':
                    house = component.name;
                    break;
                  case 'house':
                    house = component.name;
                    break;
                }
              });

              const addressObj = geoObject.properties.get('metaDataProperty')?.GeocoderMetaData?.Address;
              const postalCode = addressObj?.postal_code || '';
              
              return {
                address,
                coordinates: coords,
                country,
                region,
                city,
                street,
                house,
                postal_code: postalCode,
                components
              };
            })
            .filter(suggestion => suggestion.country === 'Россия');
          
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

  // Обработка потери фокуса - геокодируем адрес для извлечения компонентов
  const handleInputBlur = async () => {
    if (!address || address.trim().length < 3) {
      return;
    }

    if (window.ymaps && address && !selectedLocation) {
      try {
        const geocoder = window.ymaps.geocode(address, {
          results: 1,
          boundedBy: [[41.185096, 19.616318], [81.858710, 180.000000]],
          strictBounds: true
        });

        geocoder.then((res) => {
          const firstGeoObject = res.geoObjects.get(0);
          if (firstGeoObject) {
            const fullAddress = firstGeoObject.getAddressLine();
            const coords = firstGeoObject.geometry.getCoordinates();
            const addressObj = firstGeoObject.properties.get('metaDataProperty')?.GeocoderMetaData?.Address;
            const components = addressObj?.Components || [];
            const postalCode = addressObj?.postal_code || '';
            
            let country = '';
            let region = '';
            let city = '';
            let street = '';
            let house = '';
            
            components.forEach(component => {
              switch (component.kind) {
                case 'country':
                  country = component.name;
                  break;
                case 'province':
                  if (!region || !component.name.includes('федеральный округ')) {
                    region = component.name;
                  }
                  break;
                case 'administrative_area_level_1':
                  region = component.name;
                  break;
                case 'locality':
                  city = component.name;
                  break;
                case 'route':
                  street = component.name;
                  break;
                case 'street':
                  street = component.name;
                  break;
                case 'street_number':
                  house = component.name;
                  break;
                case 'house':
                  house = component.name;
                  break;
              }
            });

            if (country === 'Россия') {
              const locationData = {
                address: fullAddress,
                fullAddress: fullAddress,
                coordinates: coords,
                country,
                region,
                city,
                street,
                house,
                postal_code: postalCode,
                components
              };

              setSelectedLocation(locationData);
              if (onAddressSelect) {
                onAddressSelect(locationData);
              }
            }
          }
        }).catch((error) => {
          console.error('Ошибка геокодирования при blur:', error);
        });
      } catch (error) {
        console.error('Ошибка при геокодировании:', error);
      }
    }
  };

  // Обработка выбора предложения
  const handleSuggestionSelect = (suggestion) => {
    setAddress(suggestion.address);
    setSelectedLocation(suggestion);
    setShowSuggestions(false);
    
    if (onAddressSelect) {
      onAddressSelect({
        ...suggestion,
        fullAddress: suggestion.address,
        address: suggestion.address
      });
    }
  };

  // Обработка выбора локации на карте
  const handleMapLocationSelect = (locationData) => {
    setAddress(locationData.address || locationData.fullAddress);
    setSelectedLocation(locationData);
    setShowMapModal(false);
    
    if (onAddressSelect) {
      onAddressSelect({
        ...locationData,
        fullAddress: locationData.fullAddress || locationData.address,
        address: locationData.address || locationData.fullAddress
      });
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
          onBlur={handleInputBlur}
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
            
            <SimpleYandexMap
              onLocationSelect={handleMapLocationSelect}
              initialCenter={selectedLocation?.coordinates || [43.585472, 39.723098]}
              height="400px"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
