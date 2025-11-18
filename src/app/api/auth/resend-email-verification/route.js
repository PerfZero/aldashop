export async function POST(request) {
  try {
    const body = await request.json();
    
    const response = await fetch('https://aldalinde.ru/api/auth/resend-email-verification/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        email: body.email
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
        return Response.json({ error: data.error || 'Вы превысили лимит. Повторите попытку позже.' }, { status: 429 });
      }
      return Response.json(data, { status: response.status });
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

