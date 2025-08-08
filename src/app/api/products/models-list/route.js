export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://aldalinde.ru/api/products/models-list/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      
      if (response.status === 500 && errorText.includes('average_rating')) {
        return Response.json({ 
          error: 'Временная ошибка сервера. Попробуйте позже.',
          details: 'Проблема с рейтингом товаров'
        }, { status: 503 });
      }
      
      return Response.json({ error: `Внешний API ошибка: ${response.status}` }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      return Response.json({ error: 'Внешний API вернул не JSON' }, { status: 500 });
    }

    const data = await response.json();
    
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}