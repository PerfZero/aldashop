export async function POST(request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
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

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('[LOGOUT API] Error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
