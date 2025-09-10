export async function POST(request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    console.log('[LOGOUT API] Request body:', body);
    console.log('[LOGOUT API] Authorization header:', authHeader);
    
    const response = await fetch('https://aldalinde.ru/api/auth/logout/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        refresh: body.refresh
      }),
    });

    console.log('[LOGOUT API] Backend response status:', response.status);
    const data = await response.json();
    console.log('[LOGOUT API] Backend response data:', data);

    if (!response.ok) {
      console.log('[LOGOUT API] Backend error, returning:', data);
      return Response.json(data, { status: response.status });
    }

    console.log('[LOGOUT API] Success, returning:', data);
    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('[LOGOUT API] Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
