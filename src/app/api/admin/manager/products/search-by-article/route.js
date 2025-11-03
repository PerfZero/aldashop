export async function POST(request) {
  try {
    const body = await request.json();

    const url = 'https://aldalinde.ru/api/admin_backend/manager/products/search-by-article';

    const authHeader = request.headers.get('authorization');
    const cookieHeader = request.headers.get('cookie');

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

    let articleValue = null;
    
    if (body.data && body.data.article) {
      articleValue = String(body.data.article).trim();
    } else if (body.article) {
      articleValue = String(body.article).trim();
    }

    if (!articleValue || articleValue === '') {
      return Response.json(
        { error: 'Параметр article обязателен', receivedBody: body },
        { status: 400 }
      );
    }

    const requestBody = { article: articleValue };

    console.log('Sending request to external API:', {
      url,
      body: requestBody,
      stringified: JSON.stringify(requestBody),
      hasAuth: !!authHeader,
      articleValue
    });

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorText;
      let errorData;
      try {
        errorData = await response.json();
        errorText = JSON.stringify(errorData);
      } catch {
        errorText = await response.text();
      }
      
      console.error('External API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        requestBody: requestBody
      });
      
      return Response.json(
        { error: `HTTP error! status: ${response.status}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

