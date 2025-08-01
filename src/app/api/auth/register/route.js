export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch('http://62.181.44.89/api/auth/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        first_name: body.first_name,
        password: body.password
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error('Error during registration:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}