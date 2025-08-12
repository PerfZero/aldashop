export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return Response.json({ error: 'No authorization header' }, { status: 401 });
    }

    console.log('[merge-data] Making request with token only');

    const response = await fetch('https://aldalinde.ru/api/user/merge-data/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Authorization': authHeader,
      },
    });

    console.log('[merge-data] response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('[merge-data] error response body:', errorText);
      return Response.json({ 
        error: `Внешний API ошибка: ${response.status}`,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('[merge-data] success response:', data);
    
    return Response.json(data);
  } catch (error) {
    console.error('[merge-data] internal error:', error);
    return Response.json({ 
      error: 'Внутренняя ошибка сервера',
      details: error.message
    }, { status: 500 });
  }
}
