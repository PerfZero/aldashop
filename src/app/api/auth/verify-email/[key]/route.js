export async function GET(request, { params }) {
  const { key } = params;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email/${key}/`, {
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
      { detail: 'Произошла ошибка при подтверждении email' },
      { status: 500 }
    );
  }
} 