export async function POST(request) {
  try {
    const body = await request.json();

    console.log('[subcategory-filters] request', body);

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
      console.log('[subcategory-filters] error response', { status: response.status, body: errorText });
      return Response.json({ error: `Внешний API ошибка: ${response.status}` }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.log('[subcategory-filters] non-json response', { text });
      return Response.json({ error: 'Внешний API вернул не JSON' }, { status: 500 });
    }

    const data = await response.json();
    console.log('[subcategory-filters] success response', { data });
    
    return Response.json(data);
  } catch (error) {
    console.error('[subcategory-filters] internal error', error);
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}