'use client';
import { useState } from 'react';
import YandexMap from '../../components/YandexMap';

export default function TestMapPage() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');

  const handleLocationSelect = (locationData) => {
    console.log('Выбрана локация:', locationData);
    setSelectedLocation(locationData);
    setDebugInfo(`Последнее обновление: ${new Date().toLocaleTimeString()}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Тест Яндекс.Карт</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>Простая карта с кликами</h2>
        <YandexMap
          onLocationSelect={handleLocationSelect}
          initialCenter={[43.585472, 39.723098]}
          height="400px"
        />
      </div>

      {selectedLocation && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          background: '#f0f0f0', 
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <h3>Выбранная локация:</h3>
          <p><strong>Адрес:</strong> {selectedLocation.address}</p>
          <p><strong>Координаты:</strong> {selectedLocation.coordinates?.join(', ')}</p>
          <p><strong>Город:</strong> {selectedLocation.city}</p>
          <p><strong>Улица:</strong> {selectedLocation.street}</p>
          <p><strong>Дом:</strong> {selectedLocation.house}</p>
        </div>
      )}

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        background: '#e8f5e8', 
        borderRadius: '8px',
        border: '1px solid #4caf50'
      }}>
        <h3>Инструкции:</h3>
        <ul>
          <li>Кликните на карте, чтобы выбрать точку</li>
          <li>Нажмите кнопку "📍 Использовать мое местоположение" (должна быть видна всегда)</li>
          <li>Используйте поиск в верхнем левом углу карты</li>
          <li>Разрешите доступ к геолокации в браузере при запросе</li>
        </ul>
        
        {debugInfo && (
          <div style={{ 
            marginTop: '10px', 
            padding: '10px', 
            background: '#f0f8ff', 
            borderRadius: '4px',
            fontSize: '12px',
            color: '#666'
          }}>
            {debugInfo}
          </div>
        )}
      </div>
    </div>
  );
}
