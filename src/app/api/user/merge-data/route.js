import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const cookieHeader = request.headers.get('cookie');
    const authHeader = request.headers.get('authorization');

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

    const response = await fetch('https://aldalinde.ru/api/user/merge-data/', {
      method: 'POST',
      headers,
    });

    const data = await response.json();

    const responseHeaders = new Headers(response.headers);
    const setCookieHeader = responseHeaders.get('set-cookie');
    if (setCookieHeader) {
      responseHeaders.append('Set-Cookie', setCookieHeader);
    }

    return new NextResponse(JSON.stringify(data), {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}