'use client';
import { useState } from 'react';
import YandexMap from './YandexMap';
import AddressSelector from './AddressSelector';

const MapTest = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const handleLocationSelect = (locationData) => {
    console.log('Выбрана локация на карте:', locationData);
    setSelectedLocation(locationData);
  };

  const handleAddressSelect = (addressData) => {
    console.log('Выбран адрес:', addressData);
    setSelectedAddress(addressData);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Тест Яндекс.Карт</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>Компонент выбора адреса</h2>
        <AddressSelector
          onAddressSelect={handleAddressSelect}
          placeholder="Введите адрес или выберите на карте"
          showMap={true}
        />
        {selectedAddress && (
          <div style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
            <strong>Выбранный адрес:</strong> {selectedAddress.address}
            <br />
            <strong>Координаты:</strong> {selectedAddress.coordinates?.join(', ')}
          </div>
        )}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <h2>Карта с геолокацией</h2>
        <YandexMap
          onLocationSelect={handleLocationSelect}
          initialCenter={[43.585472, 39.723098]}
          initialZoom={12}
          height="400px"
          showGeolocation={true}
          showSearch={true}
        />
        {selectedLocation && (
          <div style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
            <strong>Выбранная локация:</strong> {selectedLocation.address}
            <br />
            <strong>Координаты:</strong> {selectedLocation.coordinates?.join(', ')}
            <br />
            <strong>Город:</strong> {selectedLocation.city}
            <br />
            <strong>Улица:</strong> {selectedLocation.street}
            <br />
            <strong>Дом:</strong> {selectedLocation.house}
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#e8f5e8', borderRadius: '8px' }}>
        <h3>Инструкции по тестированию:</h3>
        <ul>
          <li>Кликните на карте, чтобы выбрать точку</li>
          <li>Нажмите кнопку "📍 Использовать мое местоположение" (должна появиться после разрешения геолокации)</li>
          <li>Введите адрес в поле выше и выберите из предложений</li>
          <li>Нажмите кнопку 🗺️ для открытия карты в модальном окне</li>
          <li>Убедитесь, что кнопки не вызывают отправку формы</li>
        </ul>
      </div>
    </div>
  );
};

export default MapTest;

