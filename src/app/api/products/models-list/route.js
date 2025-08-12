export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('[models-list] request body:', JSON.stringify(body, null, 2));
    
    const response = await fetch('https://aldalinde.ru/api/products/models-list/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('[models-list] response status:', response.status);
    console.log('[models-list] response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[models-list] error response body:', errorText);
      
      if (response.status === 500 && errorText.includes('average_rating')) {
        return Response.json({ 
          error: 'Временная ошибка сервера. Попробуйте позже.',
          details: 'Проблема с рейтингом товаров'
        }, { status: 503 });
      }
      
      return Response.json({ 
        error: `Внешний API ошибка: ${response.status}`,
        details: errorText,
        requestBody: body
      }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.log('[models-list] non-json response:', text);
      return Response.json({ error: 'Внешний API вернул не JSON' }, { status: 500 });
    }

    const data = await response.json();
    console.log('[models-list] success response:', { count: data.count, resultsLength: data.results?.length });
    
    return Response.json(data);
  } catch (error) {
    console.error('[models-list] internal error:', error);
    return Response.json({ 
      error: 'Внутренняя ошибка сервера',
      details: error.message
    }, { status: 500 });
  }
}