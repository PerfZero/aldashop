export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch('http://62.181.44.89/api/auth/token/refresh/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        refresh: body.refresh
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error('Error during token refresh:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 