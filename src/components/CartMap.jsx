'use client';
import { useEffect, useState } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

const CartMap = ({ onLocationSelect }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(false);
  const [mapCenter, setMapCenter] = useState([43.585472, 39.723098]);
  const [selectedAddress, setSelectedAddress] = useState('');

  useEffect(() => {
    console.log('CartMap: Компонент загружен');
    
    // Проверяем доступность геолокации
    if (navigator.geolocation) {
      console.log('CartMap: Геолокация поддерживается браузером');
      
      // Проверяем разрешения (если поддерживается)
      if (navigator.permissions) {
        navigator.permissions.query({ name: 'geolocation' }).then((result) => {
          console.log('CartMap: Статус разрешения геолокации:', result.state);
          if (result.state === 'denied') {
            console.log('CartMap: Геолокация заблокирована пользователем');
          }
        }).catch((error) => {
          console.log('CartMap: Не удалось проверить разрешения:', error);
        });
      }
    } else {
      console.log('CartMap: Геолокация не поддерживается браузером');
    }
    
    const timer = setTimeout(() => {
      setIsLoaded(true);
      console.log('CartMap: Таймер сработал, карта должна загрузиться');
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleMapClick = (event) => {
    const coords = event.get('coords');
    console.log('CartMap: Клик по карте:', coords);
    setSelectedLocation(coords);
    // Не центрируем карту при клике, оставляем пользователю возможность исследовать
    // setMapCenter(coords);
    
    // Используем HTTP API для геокодирования
    console.log('CartMap: Геокодируем координаты клика через HTTP API');
    const apiKey = 'aa9feae8-022d-44d2-acb1-8cc0198f451d';
    const coordsString = `${coords[1]},${coords[0]}`; // lat,lon для HTTP API
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${coordsString}&format=json&results=1&lang=ru_RU`;
    
    console.log('CartMap: HTTP запрос для клика:', url);
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        console.log('CartMap: HTTP ответ для клика:', data);
        if (data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject) {
          const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
          const address = geoObject.metaDataProperty.GeocoderMetaData.text;
          console.log('CartMap: Адрес клика получен:', address);
          setSelectedAddress(address);
          
          if (onLocationSelect) {
            const locationData = {
              coordinates: coords,
              fullAddress: address,
              region: '',
              city: '',
              street: '',
              house: '',
              components: []
            };
            onLocationSelect(locationData);
          }
        } else {
          console.log('CartMap: Адрес клика не найден');
          setSelectedAddress('Адрес не определен');
        }
      })
      .catch(error => {
        console.log('CartMap: Ошибка геокодирования клика:', error);
        setSelectedAddress('Ошибка получения адреса');
      });
  };

  const handleGeolocationClick = () => {
    console.log('CartMap: Запрос геолокации');
    console.log('CartMap: navigator.geolocation доступен:', !!navigator.geolocation);
    
    if (navigator.geolocation) {
      setIsLoadingGeolocation(true);
      console.log('CartMap: Запрашиваем геолокацию...');
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userCoords = [latitude, longitude];
          console.log('CartMap: Геолокация получена успешно:', userCoords);
          console.log('CartMap: Точность:', position.coords.accuracy);
          setUserLocation(userCoords);
          setSelectedLocation(userCoords);
          setMapCenter(userCoords); // Центрируем карту на геолокацию
          setIsLoadingGeolocation(false);
          
          // Используем HTTP API для геокодирования (более надежно)
          console.log('CartMap: Используем HTTP API для геокодирования');
          const apiKey = 'aa9feae8-022d-44d2-acb1-8cc0198f451d';
          const coordsString = `${userCoords[1]},${userCoords[0]}`; // lat,lon для HTTP API
          const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${coordsString}&format=json&results=1&lang=ru_RU`;
          
          console.log('CartMap: HTTP запрос к геокодеру:', url);
          
          fetch(url)
            .then(response => {
              console.log('CartMap: HTTP ответ получен, статус:', response.status);
              return response.json();
            })
            .then(data => {
              console.log('CartMap: HTTP ответ геокодера:', data);
              if (data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject) {
                const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
                const address = geoObject.metaDataProperty.GeocoderMetaData.text;
                console.log('CartMap: HTTP адрес получен:', address);
                setSelectedAddress(address);
                
                // Также вызываем callback если есть
                if (onLocationSelect) {
                  const locationData = {
                    coordinates: userCoords,
                    fullAddress: address,
                    region: '',
                    city: '',
                    street: '',
                    house: '',
                    components: []
                  };
                  onLocationSelect(locationData);
                }
              } else {
                console.log('CartMap: Адрес не найден в HTTP ответе');
                setSelectedAddress('Адрес не определен');
              }
            })
            .catch(error => {
              console.log('CartMap: Ошибка HTTP геокодирования:', error);
              setSelectedAddress('Ошибка получения адреса');
            });
        },
        (error) => {
          console.log('CartMap: Ошибка геолокации:', error);
          console.log('CartMap: Код ошибки:', error.code);
          console.log('CartMap: Сообщение ошибки:', error.message);
          setIsLoadingGeolocation(false);
          
          let errorMessage = 'Не удалось получить ваше местоположение.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Доступ к геолокации запрещен. Разрешите доступ в настройках браузера.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Информация о местоположении недоступна. Проверьте подключение к интернету.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Время ожидания запроса геолокации истекло. Попробуйте еще раз.';
              break;
          }
          alert(errorMessage);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000
        }
      );
    } else {
      alert('Геолокация не поддерживается вашим браузером');
    }
  };

  if (error) {
    return (
      <div style={{ 
        height: '350px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        color: '#dc3545'
      }}>
        <div>
          <h4>Ошибка загрузки карты</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: '350px', 
      border: '1px solid #dee2e6', 
      borderRadius: '8px',
      position: 'relative',
      background: '#f8f9fa'
    }}>
      {/* Отладочная информация */}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        background: 'rgba(255,255,255,0.9)', 
        padding: '8px', 
        fontSize: '12px', 
        zIndex: 1000,
        border: '1px solid #ccc',
        borderRadius: '4px',
        fontFamily: 'monospace'
      }}>
        CartMap: {isLoaded ? 'Готово' : 'Загрузка...'} | 
        Пользователь: {userLocation ? 'Есть' : 'Нет'} | 
        Выбрано: {selectedLocation ? 'Есть' : 'Нет'} | 
        Адрес: {selectedAddress ? 'Есть' : 'Нет'}
      </div>

      {!isLoaded ? (
        <div style={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #C1AF86',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '10px'
          }}></div>
          <p>Загрузка карты...</p>
        </div>
      ) : (
        <YMaps 
          query={{
            apikey: 'aa9feae8-022d-44d2-acb1-8cc0198f451d',
            lang: 'ru_RU',
            load: 'package.full'
          }}
          onLoad={() => {
            console.log('CartMap: YMaps загружен');
          }}
          onError={(error) => {
            console.error('CartMap: Ошибка загрузки YMaps:', error);
            setError('Ошибка загрузки Яндекс.Карт: ' + error.message);
          }}
        >
          <Map
            state={{
              center: mapCenter,
              zoom: 15
            }}
            width="100%"
            height="100%"
            onClick={handleMapClick}
          >
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
      )}

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      
      {/* Поле с выбранным адресом - всегда видимое для отладки */}
      <div style={{ 
        position: 'absolute', 
        bottom: '50px', 
        left: '10px', 
        right: '10px',
        background: selectedAddress ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.9)', 
        padding: '15px', 
        borderRadius: '8px',
        border: selectedAddress ? '3px solid #28a745' : '2px solid #007bff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        zIndex: 1000,
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        <div style={{ 
          fontSize: '12px', 
          color: '#666', 
          marginBottom: '4px',
          fontWeight: 'bold'
        }}>
          📍 Выбранный адрес:
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: selectedAddress ? '#333' : '#999',
          lineHeight: '1.4',
          minHeight: '20px'
        }}>
          {selectedAddress || 'Кликните на карте или используйте геолокацию'}
        </div>
        {selectedAddress && (
          <div style={{ 
            fontSize: '10px', 
            color: '#28a745', 
            marginTop: '4px',
            fontWeight: 'bold'
          }}>
            ✅ Адрес определен
          </div>
        )}
      </div>
      
      {/* Кнопка геолокации */}
      <div style={{ 
        position: 'absolute', 
        bottom: '10px', 
        right: '10px',
        zIndex: 1000
      }}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleGeolocationClick();
          }}
          disabled={isLoadingGeolocation}
          style={{
            background: '#C1AF86',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            fontSize: '12px',
            cursor: isLoadingGeolocation ? 'not-allowed' : 'pointer',
            opacity: isLoadingGeolocation ? 0.7 : 1,
            transition: 'background-color 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
          onMouseOver={(e) => {
            if (!isLoadingGeolocation) {
              e.target.style.background = '#a8996f';
            }
          }}
          onMouseOut={(e) => {
            if (!isLoadingGeolocation) {
              e.target.style.background = '#C1AF86';
            }
          }}
        >
          {isLoadingGeolocation ? '⏳ Определяем...' : '📍 Использовать мое местоположение'}
        </button>
      </div>
    </div>
  );
};

export default CartMap;
