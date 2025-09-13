'use client';
import { useEffect, useState, useRef } from 'react';
import { YMaps, Map, Placemark, GeolocationControl, SearchControl } from '@pbe/react-yandex-maps';
import styles from './YandexMap.module.css';

const YandexMap = ({ 
  onLocationSelect, 
  initialCenter = [43.585472, 39.723098], 
  initialZoom = 12,
  height = '300px',
  showGeolocation = true,
  showSearch = true,
  className = ''
}) => {
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  // Получение геолокации пользователя
  useEffect(() => {
    if (showGeolocation && navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userCoords = [latitude, longitude];
          setUserLocation(userCoords);
          setMapCenter(userCoords);
          setIsLoading(false);
        },
        (error) => {
          console.log('Ошибка получения геолокации:', error);
          setError('Не удалось получить ваше местоположение');
          setIsLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    }
  }, [showGeolocation]);

  // Обработка клика по карте
  const handleMapClick = (event) => {
    const coords = event.get('coords');
    setSelectedLocation(coords);
    // Не центрируем карту на выбранную точку
    // setMapCenter(coords);
    
    // Геокодирование для получения адреса
    if (window.ymaps) {
      window.ymaps.geocode(coords).then((res) => {
        const firstGeoObject = res.geoObjects.get(0);
        if (firstGeoObject) {
          const address = firstGeoObject.getAddressLine();
          const components = firstGeoObject.properties.get('metaDataProperty')?.GeocoderMetaData?.Address?.Components || [];
          
          // Извлекаем компоненты адреса
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
          
          const locationData = {
            coordinates: coords,
            address: address,
            region: region,
            city: city,
            street: street,
            house: house,
            components: components
          };
          
          if (onLocationSelect) {
            onLocationSelect(locationData);
          }
        }
      }).catch((error) => {
        console.error('Ошибка геокодирования:', error);
        setError('Не удалось определить адрес для выбранной точки');
      });
    }
  };

  // Обработка клика по геолокации
  const handleGeolocationClick = () => {
    if (userLocation) {
      // Если геолокация уже получена, используем её
      setMapCenter(userLocation);
      setSelectedLocation(userLocation);
      
      if (window.ymaps) {
        window.ymaps.geocode(userLocation).then((res) => {
          const firstGeoObject = res.geoObjects.get(0);
          if (firstGeoObject) {
            const address = firstGeoObject.getAddressLine();
            const components = firstGeoObject.properties.get('metaDataProperty')?.GeocoderMetaData?.Address?.Components || [];
            
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
            
            const locationData = {
              coordinates: userLocation,
              address: address,
              region: region,
              city: city,
              street: street,
              house: house,
              components: components
            };
            
            if (onLocationSelect) {
              onLocationSelect(locationData);
            }
          }
        });
      }
    } else {
      // Если геолокация не получена, запрашиваем её
      if (navigator.geolocation) {
        setIsLoading(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            const userCoords = [latitude, longitude];
            setUserLocation(userCoords);
            setMapCenter(userCoords);
            setSelectedLocation(userCoords);
            setIsLoading(false);
            
            // Автоматически геокодируем полученные координаты
            if (window.ymaps) {
              window.ymaps.geocode(userCoords).then((res) => {
                const firstGeoObject = res.geoObjects.get(0);
                if (firstGeoObject) {
                  const address = firstGeoObject.getAddressLine();
                  const components = firstGeoObject.properties.get('metaDataProperty')?.GeocoderMetaData?.Address?.Components || [];
                  
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
                  
                  const locationData = {
                    coordinates: userCoords,
                    address: address,
                    region: region,
                    city: city,
                    street: street,
                    house: house,
                    components: components
                  };
                  
                  if (onLocationSelect) {
                    onLocationSelect(locationData);
                  }
                }
              });
            }
          },
          (error) => {
            console.log('Ошибка получения геолокации:', error);
            let errorMessage = 'Не удалось получить ваше местоположение';
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage = 'Доступ к геолокации запрещен. Разрешите доступ в настройках браузера.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage = 'Информация о местоположении недоступна.';
                break;
              case error.TIMEOUT:
                errorMessage = 'Время ожидания запроса геолокации истекло.';
                break;
            }
            setError(errorMessage);
            setIsLoading(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
          }
        );
      } else {
        setError('Геолокация не поддерживается вашим браузером');
      }
    }
  };

  return (
    <div 
      className={`${styles.mapContainer} ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Временная отладочная информация */}
      <div style={{ 
        position: 'absolute', 
        top: '5px', 
        left: '5px', 
        background: 'rgba(255,255,255,0.9)', 
        padding: '5px', 
        fontSize: '10px', 
        zIndex: 1000,
        border: '1px solid #ccc',
        borderRadius: '3px'
      }}>
        YandexMap: {isLoading ? 'Загрузка...' : 'Готово'} | 
        Геолокация: {showGeolocation ? 'Вкл' : 'Выкл'} | 
        Пользователь: {userLocation ? 'Есть' : 'Нет'} | 
        Выбрано: {selectedLocation ? 'Есть' : 'Нет'}
      </div>
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p>Получение вашего местоположения...</p>
        </div>
      )}
      
      {error && (
        <div className={styles.errorMessage}>
          <p>{error}</p>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setError(null);
            }}
            className={styles.errorClose}
          >
            ×
          </button>
        </div>
      )}
      
      <YMaps 
        query={{
          apikey: 'aa9feae8-022d-44d2-acb1-8cc0198f451d',
          lang: 'ru_RU',
          load: 'package.full'
        }}
      >
        <Map
          instanceRef={mapRef}
          state={{
            center: mapCenter,
            zoom: initialZoom,
            controls: []
          }}
          width="100%"
          height={height}
          onClick={handleMapClick}
          className={styles.map}
        >
          {/* Поиск */}
          {showSearch && (
            <SearchControl
              options={{
                float: 'left',
                noPlacemark: true,
                provider: 'yandex#search'
              }}
            />
          )}
          
          {/* Геолокация */}
          {showGeolocation && userLocation && (
            <GeolocationControl
              options={{
                float: 'right',
                noPlacemark: true
              }}
              onClick={handleGeolocationClick}
            />
          )}
          
          {/* Маркер текущего местоположения пользователя */}
          {userLocation && (
            <Placemark
              geometry={userLocation}
              options={{
                preset: 'islands#blueCircleDotIcon',
                iconColor: '#3caa3c'
              }}
              properties={{
                balloonContent: 'Ваше текущее местоположение'
              }}
            />
          )}
          
          {/* Маркер выбранной точки */}
          {selectedLocation && (
            <Placemark
              geometry={selectedLocation}
              options={{
                preset: 'islands#redDotIcon',
                iconColor: '#ff0000'
              }}
              properties={{
                balloonContent: 'Выбранная точка доставки'
              }}
            />
          )}
        </Map>
      </YMaps>
      
      <div className={styles.mapInstructions}>
        <p>Кликните на карте, чтобы выбрать точку доставки</p>
        {showGeolocation && (
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleGeolocationClick();
            }}
            className={styles.geolocationButton}
            disabled={isLoading}
          >
            {isLoading ? '⏳ Определяем местоположение...' : '📍 Использовать мое местоположение'}
          </button>
        )}
      </div>
    </div>
  );
};

export default YandexMap;
