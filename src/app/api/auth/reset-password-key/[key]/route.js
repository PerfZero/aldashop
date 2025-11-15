export async function GET(request, { params }) {
  const { key } = params;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accounts/password/reset/key/${key}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      return Response.json(data);
    } else {
      return Response.json(data, { status: response.status });
    }
  } catch (error) {
    return Response.json(
      { error: 'Произошла ошибка при обработке ссылки сброса пароля' },
      { status: 500 }
    );
  }
}

