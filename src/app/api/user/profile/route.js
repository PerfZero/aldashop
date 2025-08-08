export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return Response.json({ error: 'No authorization header' }, { status: 401 });
    }

    const response = await fetch('https://aldalinde.ru/api/user/profile/', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Authorization': authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return Response.json({ error: 'No authorization header' }, { status: 401 });
    }

    const body = await request.json();

    const response = await fetch('https://aldalinde.ru/api/user/profile/', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 