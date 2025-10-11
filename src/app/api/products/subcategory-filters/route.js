export async function POST(request) {
  try {
    const body = await request.json();


    const response = await fetch('https://aldalinde.ru/api/products/subcategory-filters/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(body),
    });


    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ 
        error: `Внешний API ошибка: ${response.status}`,
        details: errorText,
        requestBody: body
      }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      return Response.json({ error: 'Внешний API вернул не JSON' }, { status: 500 });
    }

    const data = await response.json();
    
    console.log('🔍 Filters data from server:', JSON.stringify(data, null, 2));
    
    return Response.json(data);
  } catch (error) {
    console.error('[subcategory-filters] internal error:', error);
    return Response.json({ 
      error: 'Внутренняя ошибка сервера',
      details: error.message
    }, { status: 500 });
  }
}