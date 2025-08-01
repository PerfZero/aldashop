export async function POST(request) {
  try {
    const body = await request.json();
    const { category_id, subcategory_id } = body;
    const url = 'http://62.181.44.89/api/products/subcategory-filters/';
    
    const requestBody = {
      subcategory_id: subcategory_id,
      category_id: category_id
    };
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    const data = await response.json();
    
    if (data === 400 || data.error || data.message) {
      return Response.json({ error: 'API Error', details: data }, { status: 400 });
    }
    if (!response.ok) {
      return Response.json(data, { status: response.status });
    }
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching filters:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}