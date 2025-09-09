import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    
    const headers = {
      'accept': 'application/json',
    };
    
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
      return NextResponse.json(data, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    return NextResponse.json(data, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
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
    
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch('https://aldalinde.ru/api/user/cart/', {
      method: 'POST',
      headers,
      body: JSON.stringify({ product_id, quantity }),
    });

    const data = await response.json();

    const responseHeaders = new Headers();
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      responseHeaders.set('Set-Cookie', setCookieHeader);
    }

    if (!response.ok) {
      return NextResponse.json(data, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    return NextResponse.json(data, {
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
