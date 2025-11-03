export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const params = {};
    if (searchParams.get('page')) params.page = searchParams.get('page');
    if (searchParams.get('page_size')) params.page_size = searchParams.get('page_size');
    if (searchParams.get('limit')) params.limit = searchParams.get('limit');
    if (searchParams.get('order_number')) params.order_number = searchParams.get('order_number');
    if (searchParams.get('status')) params.status = searchParams.get('status');
    if (searchParams.get('delivery_date')) params.delivery_date = searchParams.get('delivery_date');
    if (searchParams.get('comment')) params.comment = searchParams.get('comment');

    const queryString = new URLSearchParams(params).toString();
    const url = `https://aldalinde.ru/api/admin_backend/storage/orders${queryString ? `?${queryString}` : ''}`;

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

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
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

