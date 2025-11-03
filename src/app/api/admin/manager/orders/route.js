export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const params = {};
    if (searchParams.get('page')) params.page = searchParams.get('page');
    if (searchParams.get('page_size')) params.page_size = searchParams.get('page_size');
    if (searchParams.get('order_id')) params.order_id = searchParams.get('order_id');
    if (searchParams.get('phone')) params.phone = searchParams.get('phone');
    if (searchParams.get('email')) params.email = searchParams.get('email');
    if (searchParams.get('order_date')) params.order_date = searchParams.get('order_date');
    if (searchParams.get('order_date_from')) params.order_date_from = searchParams.get('order_date_from');
    if (searchParams.get('order_date_to')) params.order_date_to = searchParams.get('order_date_to');
    if (searchParams.get('address')) params.address = searchParams.get('address');
    if (searchParams.get('first_name')) params.first_name = searchParams.get('first_name');
    if (searchParams.get('last_name')) params.last_name = searchParams.get('last_name');
    if (searchParams.get('patronymic')) params.patronymic = searchParams.get('patronymic');
    if (searchParams.get('inn')) params.inn = searchParams.get('inn');
    if (searchParams.get('comment')) params.comment = searchParams.get('comment');
    if (searchParams.get('status')) params.status = searchParams.get('status');
    if (searchParams.get('processed') !== null) params.processed = searchParams.get('processed') === 'true';
    if (searchParams.get('sum_from')) params.sum_from = searchParams.get('sum_from');
    if (searchParams.get('sum_to')) params.sum_to = searchParams.get('sum_to');
    if (searchParams.get('is_canceled') !== null) params.is_canceled = searchParams.get('is_canceled') === 'true';

    const queryString = new URLSearchParams(params).toString();
    const url = `https://aldalinde.ru/api/admin_backend/manager/orders${queryString ? `?${queryString}` : ''}`;

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
