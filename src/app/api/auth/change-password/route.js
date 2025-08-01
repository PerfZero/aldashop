export async function POST(request) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');
    
    const response = await fetch('http://62.181.44.89/api/auth/change-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify({
        old_password: body.old_password,
        new_password: body.new_password
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('Error during password change:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 