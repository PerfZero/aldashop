export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    
    const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!accessToken) {
      return Response.json({ error: 'Требуется авторизация' }, { status: 401 });
    }

    const apiUrl = `https://aldalinde.ru/api/order/completed-orders/?page=${page}&limit=${limit}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: "API Error", details: response.status, message: errorText }, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
    
  } catch (error) {
    return Response.json({ error: "Internal server error", message: error.message }, { status: 500 });
  }
}
