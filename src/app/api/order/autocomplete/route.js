import { NextResponse } from 'next/server';

export async function GET(request) {
  console.log('API автодополнения: получен запрос');
  
  try {
    // Получаем заголовки авторизации из входящего запроса
    const authHeader = request.headers.get('authorization');
    console.log('Заголовок авторизации:', authHeader);
    
    const headers = {
      'Content-Type': 'application/json',
      'accept': 'application/json'
    };
    
    // Добавляем заголовок авторизации, если он есть
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch('https://aldalinde.ru/api/order/autocomplete/', {
      method: 'GET',
      headers
    });

    console.log('API автодополнения: статус ответа сервера:', response.status);
    
    if (!response.ok) {
      console.log('API автодополнения: ошибка сервера, возвращаем пустые данные');
      return Response.json({
        profile_fields: {},
        emails: [],
        delivery_addresses: [],
        pickup_addresses: [],
        legal_persons: [],
        can_edit_profile: false
      });
    }
    
    const data = await response.json();
    console.log('API автодополнения: данные от сервера:', data);
    
    return Response.json(data);
  } catch (error) {
    console.error('API автодополнения: ошибка при запросе:', error);
    return Response.json({
      profile_fields: {},
      emails: [],
      delivery_addresses: [],
      pickup_addresses: [],
      legal_persons: [],
      can_edit_profile: false
    });
  }
} 