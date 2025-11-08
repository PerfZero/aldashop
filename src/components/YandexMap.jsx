'use client';
import { useEffect, useState, useRef } from 'react';
import { YMaps, Map, Placemark, SearchControl, ZoomControl, GeolocationControl } from '@pbe/react-yandex-maps';

const YandexMap = ({ 
  initialCenter = [55.751574, 37.573856],
  height = '400px',
  onLocationSelect,
  selectedCoordinates,
  selectedAddress
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const mapRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (selectedCoordinates && Array.isArray(selectedCoordinates) && selectedCoordinates.length === 2) {
      setSelectedLocation(selectedCoordinates);
      setMapCenter(selectedCoordinates);
      if (mapRef.current) {
        mapRef.current.setCenter(selectedCoordinates, 15);
      }
    }
  }, [selectedCoordinates]);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !window.ymaps) return;

    const allowedRegionCodes = ['RU-MOW', 'RU-MOS'];
    
    window.ymaps.borders.load('RU', {
      lang: 'ru_RU'
    }).then((result) => {
      const regions = result.features.filter(feature => {
        const isoCode = feature.properties?.iso3166;
        return isoCode && allowedRegionCodes.includes(isoCode);
      });
      
      if (regions.length > 0 && mapRef.current) {
        const geoObjects = new window.ymaps.GeoObjectCollection();
        
        regions.forEach(region => {
          geoObjects.add(region);
        });
        
        const bounds = geoObjects.getBounds();
        if (bounds) {
          mapRef.current.options.set('restrictMapArea', [
            [bounds[0][0], bounds[0][1]],
            [bounds[1][0], bounds[1][1]]
          ]);
        }
      }
    }).catch(error => {
      console.error('Ошибка загрузки границ регионов:', error);
    });
  }, [mapReady]);


  const handleMapClick = (event) => {
    const coords = event.get('coords');
    setSelectedLocation(coords);
    setMapCenter(coords);
    
    const apiKey = 'aa9feae8-022d-44d2-acb1-8cc0198f451d';
    const coordsString = `${coords[1]},${coords[0]}`;
    const url = `https://geocode-maps.yandex.ru/v1/?apikey=${apiKey}&geocode=${coordsString}&format=json&results=1&lang=ru_RU`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject) {
          const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
          const address = geoObject.metaDataProperty.GeocoderMetaData.text;
          const addressObj = geoObject.metaDataProperty.GeocoderMetaData.Address;
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
          
          if (country !== 'Россия') {
            alert('Доставка возможна только по территории России');
            setSelectedLocation(null);
            return;
          }

          const allowedRegionNames = ['Московская область', 'Москва', 'Москва г', 'Московская обл.'];
          const isAllowedRegion = allowedRegionNames.some(name => 
            region.includes(name) || city.includes('Москва')
          );

          if (!isAllowedRegion) {
            alert('Доставка возможна только по Москве и Московской области');
            setSelectedLocation(null);
            return;
          }
          
          if (onLocationSelect) {
            const locationData = {
              coordinates: coords,
              fullAddress: address,
              address: address,
              region: region,
              city: city,
              street: street,
              house: house,
              postal_code: postalCode,
              components: components
            };
            onLocationSelect(locationData);
          }
        }
      })
      .catch(error => {
        console.error('Ошибка геокодирования:', error);
      });
  };

  if (!isLoaded) {
    return (
      <div style={{ width: '100%', height: height }}>
        Загрузка карты...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: height }}>
      <YMaps 
        query={{
          apikey: 'aa9feae8-022d-44d2-acb1-8cc0198f451d',
          lang: 'ru_RU',
          load: 'package.full'
        }}
      >
        <Map
          instanceRef={mapRef}
          defaultState={{
            center: mapCenter,
            zoom: 15
          }}
          options={{}}
          width="100%"
          height="100%"
          onClick={handleMapClick}
          onLoad={() => {
            setMapReady(true);
          }}
        >
          <ZoomControl />
          <SearchControl
            options={{
              size: 'large',
              provider: 'yandex#search',
              noPlacemark: false
            }}
          />
          {selectedLocation && (
            <Placemark
              geometry={selectedLocation}
              options={{
                preset: 'islands#redDotIcon',
                iconColor: '#ff0000'
              }}
              properties={{
                balloonContent: selectedAddress || 'Выбранная точка доставки'
              }}
            />
          )}
        </Map>
      </YMaps>
    </div>
  );
};

export default YandexMap;
