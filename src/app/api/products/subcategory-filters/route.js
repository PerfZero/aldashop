export async function POST(request) {
  try {
    const body = await request.json();
    const { category_id, subcategory_id } = body;
    
    const url = 'https://aldalinde.ru/api/products/subcategory-filters/';
    const requestBody = {
      subcategory_id: subcategory_id,
      category_id: category_id
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: `Внешний API ошибка: ${response.status}` }, { status: response.status });
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      return Response.json({ error: 'Внешний API вернул не JSON' }, { status: 500 });
    }
    
    const data = await response.json();
    
    if (data === 400 || data.error || data.message) {
      return Response.json({ error: 'API Error', details: data }, { status: 400 });
    }
    
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}