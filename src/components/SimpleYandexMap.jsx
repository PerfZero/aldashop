'use client';
import { useEffect, useState } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

const SimpleYandexMap = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('SimpleYandexMap: Компонент загружен');
    
    // Проверяем, загружена ли библиотека Яндекс.Карт
    const checkYmaps = () => {
      if (window.ymaps) {
        console.log('SimpleYandexMap: Яндекс.Карты загружены');
        setIsLoaded(true);
      } else {
        console.log('SimpleYandexMap: Яндекс.Карты еще не загружены');
        setTimeout(checkYmaps, 100);
      }
    };
    
    checkYmaps();
  }, []);

  const handleMapClick = (event) => {
    const coords = event.get('coords');
    console.log('SimpleYandexMap: Клик по карте:', coords);
  };

  if (error) {
    return (
      <div style={{ 
        padding: '20px', 
        background: '#ffebee', 
        border: '1px solid #f44336',
        borderRadius: '8px',
        color: '#d32f2f'
      }}>
        <h3>Ошибка загрузки карты</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '400px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <div style={{ padding: '10px', background: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
        <p>Статус: {isLoaded ? '✅ Загружено' : '⏳ Загрузка...'}</p>
        <p>API ключ: aa9feae8-022d-44d2-acb1-8cc0198f451d</p>
      </div>
      
      <YMaps 
        query={{
          apikey: 'aa9feae8-022d-44d2-acb1-8cc0198f451d',
          lang: 'ru_RU',
          load: 'package.full'
        }}
        onLoad={() => {
          console.log('SimpleYandexMap: YMaps загружен');
          setIsLoaded(true);
        }}
        onError={(error) => {
          console.error('SimpleYandexMap: Ошибка загрузки YMaps:', error);
          setError('Ошибка загрузки Яндекс.Карт: ' + error.message);
        }}
      >
        <Map
          state={{
            center: [43.585472, 39.723098],
            zoom: 12
          }}
          width="100%"
          height="350px"
          onClick={handleMapClick}
        >
          <Placemark 
            geometry={[43.585472, 39.723098]}
            properties={{
              balloonContent: 'Сочи, ул. Кипарисовая, 56'
            }}
          />
        </Map>
      </YMaps>
    </div>
  );
};

export default SimpleYandexMap;
