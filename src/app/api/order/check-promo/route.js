export async function POST(request) {
  const body = await request.json();
  const { promo_code, current_total } = body;
  const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');

  const response = await fetch('https://aldalinde.ru/api/order/check-promo/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
    },
    body: JSON.stringify({
      promo_code,
      current_total
    })
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
} 