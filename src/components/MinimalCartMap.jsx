'use client';
import { useEffect, useState, useRef } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

const MinimalCartMap = ({ onLocationSelect, className = '' }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoadingGeolocation, setIsLoadingGeolocation] = useState(false);
  const [mapCenter, setMapCenter] = useState([43.585472, 39.723098]);
  
  console.log('MinimalCartMap: Текущий центр карты:', mapCenter);
  const [selectedAddress, setSelectedAddress] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleMapClick = (event) => {
    const coords = event.get('coords');
    setSelectedLocation(coords);
    
    // HTTP API для геокодирования
    const apiKey = 'aa9feae8-022d-44d2-acb1-8cc0198f451d';
    const coordsString = `${coords[1]},${coords[0]}`;
    const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${coordsString}&format=json&results=1&lang=ru_RU`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject) {
          const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
          const address = geoObject.metaDataProperty.GeocoderMetaData.text;
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
        }
      })
      .catch(error => {
        setSelectedAddress('Ошибка получения адреса');
      });
  };

  const handleGeolocationClick = () => {
    if (navigator.geolocation) {
      setIsLoadingGeolocation(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userCoords = [latitude, longitude];
          
          setSelectedLocation(userCoords);
          setMapCenter(userCoords);
          console.log('MinimalCartMap: Устанавливаем центр карты:', userCoords);
          
          // Центрируем карту через ref
          if (mapRef.current) {
            mapRef.current.setCenter(userCoords, 15);
            console.log('MinimalCartMap: Карта отцентрирована через ref');
          }
          
          setIsLoadingGeolocation(false);
          
          // HTTP API для геокодирования
          const apiKey = 'aa9feae8-022d-44d2-acb1-8cc0198f451d';
          const coordsString = `${userCoords[1]},${userCoords[0]}`;
          const url = `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&geocode=${coordsString}&format=json&results=1&lang=ru_RU`;
          
          fetch(url)
            .then(response => response.json())
            .then(data => {
              if (data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject) {
                const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
                const address = geoObject.metaDataProperty.GeocoderMetaData.text;
                setSelectedAddress(address);
                
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
              }
            })
            .catch(error => {
              setSelectedAddress('Ошибка получения адреса');
            });
        },
        (error) => {
          setIsLoadingGeolocation(false);
        }
      );
    }
  };

  if (!isLoaded) {
    return (
      <div className={className} style={{ 
        height: '300px', 
        background: '#f8f9fa', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ color: '#6c757d', fontSize: '14px' }}>Загрузка карты...</div>
      </div>
    );
  }

  return (
    <div className={className} style={{ position: 'relative' }}>
      <YMaps query={{ apikey: 'aa9feae8-022d-44d2-acb1-8cc0198f451d', lang: 'ru_RU' }}>
        <Map
          width="100%"
          height="300px"
          state={{
            center: mapCenter,
            zoom: 15
          }}
          onClick={handleMapClick}
          instanceRef={mapRef}
        >
          {/* Маркер выбранной точки */}
          {selectedLocation && (
            <Placemark
              geometry={selectedLocation}
              options={{
                preset: 'islands#redDotIcon',
                iconColor: '#ff0000'
              }}
            />
          )}
        </Map>
      </YMaps>
      
      {/* Кнопка геолокации */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleGeolocationClick();
        }}
        disabled={isLoadingGeolocation}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: '#C1AF86',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '8px 12px',
          fontSize: '12px',
          cursor: isLoadingGeolocation ? 'not-allowed' : 'pointer',
          opacity: isLoadingGeolocation ? 0.6 : 1,
          zIndex: 1000
        }}
      >
        {isLoadingGeolocation ? '⏳' : '📍'} Моё местоположение
      </button>
      
    </div>
  );
};

export default MinimalCartMap;
