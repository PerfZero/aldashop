export async function POST(request, { params }) {
  const { uidb64, token } = params;

  try {
    const body = await request.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password-confirm/${uidb64}/${token}/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (response.ok) {
      return Response.json(data);
    } else {
      return Response.json(data, { status: response.status });
    }
  } catch (error) {
    return Response.json(
      { error: 'Произошла ошибка при сбросе пароля' },
      { status: 500 }
    );
  }
} 