export async function POST(request) {
  try {
    const body = await request.json();

    console.log('[subcategory-filters] request body:', JSON.stringify(body, null, 2));

    const response = await fetch('https://aldalinde.ru/api/products/subcategory-filters/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('[subcategory-filters] response status:', response.status);
    console.log('[subcategory-filters] response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[subcategory-filters] error response body:', errorText);
      return Response.json({ 
        error: `Внешний API ошибка: ${response.status}`,
        details: errorText,
        requestBody: body
      }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.log('[subcategory-filters] non-json response:', text);
      return Response.json({ error: 'Внешний API вернул не JSON' }, { status: 500 });
    }

    const data = await response.json();
    console.log('[subcategory-filters] success response:', { filtersCount: Array.isArray(data) ? data.length : 'not array' });
    
    return Response.json(data);
  } catch (error) {
    console.error('[subcategory-filters] internal error:', error);
    return Response.json({ 
      error: 'Внутренняя ошибка сервера',
      details: error.message
    }, { status: 500 });
  }
}