import { NextResponse } from 'next/server';

export async function DELETE(request, { params }) {
  try {
    const { productId } = params;
    const cookieHeader = request.headers.get('cookie');
    const url = new URL(request.url);
    const removeAll = url.searchParams.get('all') === 'true';

    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const apiUrl = removeAll 
      ? `https://aldalinde.ru/api/user/cart/${productId}/?all=true`
      : `https://aldalinde.ru/api/user/cart/${productId}/`;

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers,
    });

    const responseHeaders = new Headers();
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      responseHeaders.set('Set-Cookie', setCookieHeader);
    }

    if (response.status === 204) {
      return new NextResponse(null, { status: 204, headers: responseHeaders });
    }

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data, {
        status: 200,
        headers: responseHeaders,
      });
    }

    return NextResponse.json({ error: 'Failed to remove from cart' }, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
