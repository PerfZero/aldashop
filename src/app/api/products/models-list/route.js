export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('category_id');
  const subcategoryId = searchParams.get('subcategory_id');

  try {
    let url = `${process.env.NEXT_PUBLIC_API_URL}/products/models-list/`;
    const params = new URLSearchParams();

    if (categoryId && categoryId !== 'null') {
      params.append('category_id', categoryId);
    }

    if (subcategoryId && subcategoryId !== 'null') {
      params.append('subcategory_id', subcategoryId);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      return Response.json(data);
    } else {
      return Response.json(data, { status: response.status });
    }
  } catch (error) {
    return Response.json(
      { detail: 'Произошла ошибка при получении списка моделей' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const cookieHeader = request.headers.get('cookie');
    const authHeader = request.headers.get('authorization');
    
    console.log('[models-list] request body:', JSON.stringify(body, null, 2));
    console.log('[models-list] category_id:', body.category_id);
    console.log('[models-list] subcategory_id:', body.subcategory_id);
    
    const headers = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }
    
    const response = await fetch('https://aldalinde.ru/api/products/models-list/', {
      method: 'POST',
      headers,
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