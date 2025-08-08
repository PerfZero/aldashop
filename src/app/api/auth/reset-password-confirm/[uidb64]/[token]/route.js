export async function POST(request, { params }) {
  try {
    const { uidb64, token } = params;
    const body = await request.json();
    
    const response = await fetch(`https://aldalinde.ru/api/auth/reset-password-confirm/${uidb64}/${token}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        new_password: body.new_password
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }

    return Response.json(data, { status: 200 });
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
} 