export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    
    const headers = {
      'accept': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch('https://aldalinde.ru/api/user/cart/', {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    
    const responseHeaders = new Headers();
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      responseHeaders.set('Set-Cookie', setCookieHeader);
    }

    if (!response.ok) {
      return Response.json(data, { status: response.status, headers: responseHeaders });
    }

    return Response.json(data, { status: 200, headers: responseHeaders });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

    const body = await request.json();
    const { product_id, quantity = 1 } = body;

    if (!product_id) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (typeof product_id !== 'number' && !Number.isInteger(Number(product_id))) {
      return new Response(JSON.stringify({ error: 'Product ID must be an integer' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (quantity && (typeof quantity !== 'number' || quantity < 1)) {
      return new Response(JSON.stringify({ error: 'Quantity must be a positive integer' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const headers = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch('https://aldalinde.ru/api/user/cart/', {
      method: 'POST',
      headers,
      body: JSON.stringify({ product_id, quantity }),
    });

    const data = await response.json();
    
    const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      responseHeaders.set('Set-Cookie', setCookieHeader);
    }

    if (!response.ok) {
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: responseHeaders,
      });
    }

    return new Response(JSON.stringify(data), {
      status: 201,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 