import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    console.log('Создание заказа: получены данные:', body);
    
    const headers = {
      'Content-Type': 'application/json',
      'accept': 'application/json'
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const response = await fetch('https://aldalinde.ru/api/order/create-order/', {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    console.log('Создание заказа: статус ответа сервера:', response.status);
    
    const data = await response.json();
    console.log('Создание заказа: данные от сервера:', data);
    
    return Response.json(data, { status: response.status });
  } catch (error) {
    console.error('Создание заказа: ошибка при запросе:', error);
    return Response.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
} 