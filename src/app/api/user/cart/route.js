export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    const headers = {
      'accept': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch('http://62.181.44.89/api/user/cart/', {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching user cart:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const body = await request.json();
    
    const headers = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch('http://62.181.44.89/api/user/cart/', {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    return Response.json(data, { status: 201 });
  } catch (error) {
    console.error('Error adding item to cart:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 