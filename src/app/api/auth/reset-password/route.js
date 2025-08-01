export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch('http://62.181.44.89/api/auth/reset-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        email: body.email
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('Error during password reset:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 