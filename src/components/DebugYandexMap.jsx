'use client';
import { useEffect, useState, useRef } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import styles from './YandexMap.module.css';

const DebugYandexMap = () => {
  const [mapCenter, setMapCenter] = useState([43.585472, 39.723098]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('Инициализация...');
  const [showGeolocation, setShowGeolocation] = useState(true);

  useEffect(() => {
    setDebugInfo('Компонент загружен, showGeolocation: ' + showGeolocation);
  }, [showGeolocation]);

  const handleMapClick = (event) => {
    const coords = event.get('coords');
    console.log('Клик по карте:', coords);
    setSelectedLocation(coords);
    // Не центрируем карту на выбранную точку
    // setMapCenter(coords);
    setDebugInfo(`Клик по карте: ${coords.join(', ')}`);
  };

  const handleGeolocationClick = () => {
    setDebugInfo('Запрос геолокации...');
    if (navigator.geolocation) {
      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userCoords = [latitude, longitude];
          setUserLocation(userCoords);
          setMapCenter(userCoords);
          setSelectedLocation(userCoords);
          setIsLoading(false);
          setDebugInfo(`Геолокация получена: ${userCoords.join(', ')}`);
        },
        (error) => {
          console.log('Ошибка геолокации:', error);
          setError('Ошибка геолокации: ' + error.message);
          setIsLoading(false);
          setDebugInfo('Ошибка геолокации: ' + error.message);
        }
      );
    } else {
      setError('Геолокация не поддерживается');
      setDebugInfo('Геолокация не поддерживается');
    }
  };

  return (
    <div style={{ width: '100%', height: '500px', border: '1px solid #ddd', borderRadius: '8px' }}>
      {/* Отладочная информация */}
      <div style={{ 
        padding: '10px', 
        background: '#f0f8ff', 
        borderBottom: '1px solid #ddd',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <div><strong>Debug Info:</strong> {debugInfo}</div>
        <div><strong>showGeolocation:</strong> {showGeolocation ? 'true' : 'false'}</div>
        <div><strong>userLocation:</strong> {userLocation ? userLocation.join(', ') : 'null'}</div>
        <div><strong>selectedLocation:</strong> {selectedLocation ? selectedLocation.join(', ') : 'null'}</div>
        <div><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</div>
        <div><strong>error:</strong> {error || 'null'}</div>
      </div>

      {/* Карта */}
      <div style={{ height: '350px' }}>
        <YMaps 
          query={{
            apikey: 'aa9feae8-022d-44d2-acb1-8cc0198f451d',
            lang: 'ru_RU',
            load: 'package.full'
          }}
        >
          <Map
            state={{
              center: mapCenter,
              zoom: 12
            }}
            width="100%"
            height="100%"
            onClick={handleMapClick}
          >
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
      </div>

      {/* Инструкции и кнопка */}
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

export default DebugYandexMap;
