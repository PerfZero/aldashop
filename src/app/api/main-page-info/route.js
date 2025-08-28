export async function GET() {
  try {
    const response = await fetch('https://aldalinde.ru/api/main-page-info/', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    console.log('[main-page-info] response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[main-page-info] error response body:', errorText);
      
      return Response.json({ 
        error: `Внешний API ошибка: ${response.status}`,
        details: errorText
      }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.log('[main-page-info] non-json response:', text);
      return Response.json({ error: 'Внешний API вернул не JSON' }, { status: 500 });
    }

    const data = await response.json();
    console.log('[main-page-info] success response:', data);
    
    return Response.json(data);
  } catch (error) {
    console.error('[main-page-info] internal error:', error);
    return Response.json({ 
      error: 'Внутренняя ошибка сервера',
      details: error.message
    }, { status: 500 });
  }
}

