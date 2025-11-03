'use client';
import { useEffect, useRef } from 'react';

const YandexMap = ({ 
  onLocationSelect, 
  initialCenter = [55.751574, 37.573856], 
  height = '400px'
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const placemarkRef = useRef(null);
  const areaPolygonRef = useRef(null);
  const apiKey = 'aa9feae8-022d-44d2-acb1-8cc0198f451d';

  const allowedRegionCodes = ['RU-MOS', 'RU-MOW', 'RU-SAM'];

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initMap = () => {
      if (!window.ymaps) return;

      window.ymaps.ready(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        mapRef.current = new window.ymaps.Map(mapContainerRef.current, {
          center: initialCenter,
          zoom: 10
        });

        if (window.ymaps.borders && window.ymaps.borders.load) {
          window.ymaps.borders.load('RU', {
            lang: 'ru',
            quality: 2
          }).then((geojson) => {
            const regions = window.ymaps.geoQuery(geojson);
            const allowedRegions = allowedRegionCodes.map(code => 
              regions.search(`properties.iso3166 = "${code}"`)
            ).filter(region => region.getLength() > 0);
            
            allowedRegions.forEach(region => {
              region.setOptions({
                fillColor: '#00FF0022',
                strokeColor: '#00FF00',
                strokeWidth: 2,
                strokeStyle: 'solid',
                opacity: 0.5
              });
              
              mapRef.current.geoObjects.add(region);
            });
            
            if (allowedRegions.length > 0) {
              areaPolygonRef.current = allowedRegions;
            }
          }).catch((error) => {
            console.error('Ошибка загрузки границ:', error);
          });
        }

        mapRef.current.events.add('click', (e) => {
          const coords = e.get('coords');

          if (placemarkRef.current) {
            mapRef.current.geoObjects.remove(placemarkRef.current);
          }

          placemarkRef.current = new window.ymaps.Placemark(coords, {
            balloonContent: 'Выбранная точка доставки',
            hintContent: 'Точка доставки'
          }, {
            preset: 'islands#redDotIcon',
            draggable: false
          });

          mapRef.current.geoObjects.add(placemarkRef.current);

          const geocodeWithHTTP = (coords) => {
            const [lat, lon] = coords;
            const url = `https://geocode-maps.yandex.ru/v1/?apikey=${apiKey}&geocode=${lon},${lat}&format=json&results=1&lang=ru_RU`;
            
            fetch(url)
              .then(response => response.json())
              .then(data => {
                if (data.response?.GeoObjectCollection?.featureMember?.[0]?.GeoObject) {
                  const geoObject = data.response.GeoObjectCollection.featureMember[0].GeoObject;
                  const address = geoObject.metaDataProperty?.GeocoderMetaData?.text || '';
                  const addressObj = geoObject.metaDataProperty?.GeocoderMetaData?.Address;
                  const components = addressObj?.Components || [];
                  const postalCode = addressObj?.postal_code || '';

                  let country = '';
                  let region = '';
                  let regionIso = '';
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
                      case 'street':
                        street = component.name;
                        break;
                      case 'street_number':
                      case 'house':
                        house = component.name;
                        break;
                    }
                  });

                  const allowedRegionNames = [
                    'Московская область', 'Москва', 'Москва г',
                    'Самарская область', 'Самара'
                  ];

                  let regionFound = false;
                  components.forEach(comp => {
                    if (comp.kind === 'administrative_area_level_1' || comp.kind === 'province') {
                      const compName = comp.name || '';
                      if (allowedRegionNames.some(name => 
                        compName.includes(name) || 
                        compName === name ||
                        (name.includes('Московская') && compName.includes('Московская')) ||
                        (name.includes('Москва') && compName.includes('Москва')) ||
                        (name.includes('Самарская') && compName.includes('Самарская')) ||
                        (name.includes('Самара') && compName.includes('Самара'))
                      )) {
                        regionFound = true;
                      }
                    }
                  });

                  if (!regionFound && region) {
                    const isAllowed = allowedRegionNames.some(name => 
                      region.includes(name) || 
                      region === name ||
                      (name.includes('Московская') && region.includes('Московская')) ||
                      (name.includes('Москва') && region.includes('Москва')) ||
                      (name.includes('Самарская') && region.includes('Самарская')) ||
                      (name.includes('Самара') && region.includes('Самара'))
                    );

                    if (!isAllowed) {
                      alert('Доставка осуществляется только по разрешенным областям. Выбранная точка находится вне зоны доставки.');
                      if (placemarkRef.current) {
                        mapRef.current.geoObjects.remove(placemarkRef.current);
                        placemarkRef.current = null;
                      }
                      return;
                    }
                  }

                  if (placemarkRef.current) {
                    placemarkRef.current.properties.set('balloonContent', address || 'Выбранная точка доставки');
                  }

                  if (onLocationSelect) {
                    onLocationSelect({
                      coordinates: coords,
                      fullAddress: address,
                      address: address,
                      region: region,
                      city: city,
                      street: street,
                      house: house,
                      postal_code: postalCode,
                      components: components
                    });
                  }
                }
              })
              .catch((error) => {
                console.error('Ошибка HTTP геокодирования:', error);
                if (placemarkRef.current) {
                  placemarkRef.current.properties.set('balloonContent', `Координаты: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`);
                }
                if (onLocationSelect) {
                  onLocationSelect({
                    coordinates: coords,
                    fullAddress: '',
                    address: '',
                    region: '',
                    city: '',
                    street: '',
                    house: '',
                    postal_code: '',
                    components: []
                  });
                }
              });
          };

          geocodeWithHTTP(coords);
        });
      });
    };

    if (window.ymaps && window.ymaps.ready) {
      initMap();
      return;
    }

    if (document.querySelector(`script[src*="api-maps.yandex.ru/2.1"]`)) {
      const checkInterval = setInterval(() => {
        if (window.ymaps && window.ymaps.ready) {
          clearInterval(checkInterval);
          initMap();
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;

    script.onload = () => {
      if (window.ymaps && window.ymaps.ready) {
        initMap();
      }
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (mapRef.current && mapRef.current.destroy) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
      placemarkRef.current = null;
    };
  }, [initialCenter, onLocationSelect]);

  return (
    <div 
      ref={mapContainerRef}
      style={{ 
        width: '100%', 
        height: height, 
        borderRadius: '8px', 
        overflow: 'hidden', 
        minHeight: '400px' 
      }}
    />
  );
};

export default YandexMap;
