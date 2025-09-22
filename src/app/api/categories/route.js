export async function GET() {
  try {
    const response = await fetch('https://aldalinde.ru/api/products/category-list/', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error ${response.status}:`, errorText);
      return Response.json({ 
        error: `Внешний API ошибка: ${response.status}`,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    
    return Response.json(data, {
      headers: {
        'Cache-Control': 'public, max-age=300',
      },
    });
  } catch (error) {
    console.error('Categories API Error:', error);
    return Response.json({ 
      error: 'Внутренняя ошибка сервера',
      details: error.message
    }, { status: 500 });
  }
}