export async function GET(request, { params }) {
  try {
    const { key } = params;
    
    const response = await fetch(`https://aldalinde.ru/api/auth/verify-email/${key}/`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
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