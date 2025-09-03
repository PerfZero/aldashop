export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const sortBy = searchParams.get('sort_by') || 'newest';
    const limit = searchParams.get('limit') || '3';
    const page = searchParams.get('page') || '1';

    if (!productId) {
      return Response.json({ error: "product_id is required" }, { status: 400 });
    }

    const apiUrl = `https://aldalinde.ru/api/products/reviews/${productId}/?sort_by=${sortBy}&limit=${limit}&page=${page}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: "API Error", details: response.status, message: errorText }, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "API Error", details: 500 }, { status: 500 });
  }
}
