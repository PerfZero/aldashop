'use client';
import { useEffect, useState, useRef } from 'react';
import { YMaps, Map, Placemark, ZoomControl } from '@pbe/react-yandex-maps';

const YandexMap = ({ 
  initialCenter = [55.751574, 37.573856],
  height = '400px',
  onLocationSelect,
  selectedCoordinates,
  selectedAddress,
  allowedRegionNames = []
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState(initialCenter);
  const mapRef = useRef(null);
  const searchControlRef = useRef(null);

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

    const removeAllSearchControls = () => {
      if (mapRef.current && mapRef.current.controls) {
        try {
          const controls = mapRef.current.controls;
          const allControls = [];
          
          if (controls.each) {
            controls.each((control) => {
              try {
                if (control && typeof control.get === 'function') {
                  const name = control.get('name');
                  if (name === 'searchControl') {
                    allControls.push(control);
                  }
                }
              } catch {
              }
            });
          }
          
          allControls.forEach((control) => {
            try {
              controls.remove(control);
            } catch (e) {
            }
          });
          
          if (allControls.length > 0 && window.ymaps) {
            const searchControl = new window.ymaps.control.SearchControl({
              options: {
                size: 'large',
                provider: 'yandex#search',
                noPlacemark: false
              }
            });
            controls.add(searchControl);
          }
        } catch (e) {
        }
      }
    };

    setTimeout(removeAllSearchControls, 300);
    setTimeout(removeAllSearchControls, 600);
    setTimeout(removeAllSearchControls, 1000);

    if (allowedRegionNames && allowedRegionNames.length > 0) {
      window.ymaps.borders.load('RU', {
        lang: 'ru_RU'
      }).then((result) => {
        const regions = result.features.filter(feature => {
          const regionName = feature.properties?.name;
          return regionName && allowedRegionNames.includes(regionName);
        });
        
        if (regions.length > 0 && mapRef.current) {
          try {
            const geoQuery = window.ymaps.geoQuery({
              type: 'FeatureCollection',
              features: regions
            });
            
            const bounds = geoQuery.getBounds();
            if (bounds) {
              mapRef.current.options.set('restrictMapArea', [
                [bounds[0][0], bounds[0][1]],
                [bounds[1][0], bounds[1][1]]
              ]);
            }
          } catch (error) {
            console.error('Ошибка при обработке границ регионов:', error);
          }
        }
      }).catch(error => {
        console.error('Ошибка загрузки границ регионов:', error);
      });
    }
  }, [mapReady, allowedRegionNames]);


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

          if (allowedRegionNames && allowedRegionNames.length > 0) {
            const isAllowedRegion = allowedRegionNames.some(name => {
              const normalizedName = name.toLowerCase();
              const normalizedRegion = region.toLowerCase();
              const normalizedCity = city.toLowerCase();
              return normalizedRegion.includes(normalizedName) || 
                     normalizedCity.includes(normalizedName) ||
                     normalizedName.includes(normalizedRegion) ||
                     normalizedName.includes(normalizedCity);
            });

            if (!isAllowedRegion) {
              alert(`Доставка возможна только в следующие регионы: ${allowedRegionNames.join(', ')}`);
              setSelectedLocation(null);
              return;
            }
          }

          if (!street || !street.trim()) {
            alert('Пожалуйста, выберите адрес с указанием улицы. Необходимо выбрать точку на карте, где указана улица.');
            setSelectedLocation(null);
            return;
          }

          if (!house || !house.trim()) {
            alert('Пожалуйста, выберите адрес с указанием номера дома. Необходимо выбрать точку на карте, где указан номер дома.');
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
          options={{
            suppressMapOpenBlock: true
          }}
          width="100%"
          height="100%"
          onClick={handleMapClick}
          onLoad={() => {
            setMapReady(true);
          }}
        >
          <ZoomControl />
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
