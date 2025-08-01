export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch('http://62.181.44.89/api/products/models-list/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    return Response.json(data);
  } catch (error) {
    console.error('Error fetching products:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}