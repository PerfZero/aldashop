export async function GET() {
  try {
    const response = await fetch('https://aldalinde.ru/api/products/category-list/', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}