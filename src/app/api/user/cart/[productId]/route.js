export async function DELETE(request, { params }) {
  try {
    const { productId } = params;
    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');

    const url = all === 'true' 
      ? `https://aldalinde.ru/api/user/cart/${productId}/?all=true`
      : `https://aldalinde.ru/api/user/cart/${productId}/`;

    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });
    
    const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      responseHeaders.set('Set-Cookie', setCookieHeader);
    }

    if (response.status === 204) {
      return new Response(null, { status: 204, headers: responseHeaders });
    }

    if (response.ok) {
      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: responseHeaders,
      });
    }

    return new Response(JSON.stringify({ error: 'Failed to delete item' }), {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 