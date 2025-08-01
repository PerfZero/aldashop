export async function POST(request, { params }) {
  try {
    const { provider } = params;
    const body = await request.json();
    
    const response = await fetch(`http://62.181.44.89/api/auth/social/${provider}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        access_token: body.access_token
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('Error during social auth:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 