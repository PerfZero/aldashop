export async function POST(request) {
  try {
    const body = await request.json();
    const cookieHeader = request.headers.get('cookie');
    const authHeader = request.headers.get('authorization');
    
    const apiRequestBody = {
      model_id: body.model_id,
      ...(body.size_id && { size_id: body.size_id }),
      ...(body.color_id && { color_id: body.color_id }),
      ...(body.material_id && { material_id: body.material_id }),
    };
    
    const headers = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    };
    
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }
    
    const response = await fetch('https://aldalinde.ru/api/products/product-detail/', {
      method: 'POST',
      headers,
      body: JSON.stringify(apiRequestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: "API Error", details: response.status, message: errorText }, { status: response.status });
    }

    const responseText = await response.text();
    
    if (!responseText) {
      return Response.json({ error: "Empty response from API" }, { status: 500 });
    }

    let data;
    try {
      data = JSON.parse(responseText);
      
      if (data.photos && Array.isArray(data.photos)) {
        data.photos = data.photos.map(photo => ({
          ...photo,
          photo: photo.photo.startsWith('http') ? photo.photo : `https://aldalinde.ru${photo.photo}`
        }));
      }
      
      if (data.available_sizes && Array.isArray(data.available_sizes)) {
        data.available_sizes = data.available_sizes.map(size => ({
          ...size,
          title: size.value
        }));
      }
      
    } catch (parseError) {
      return Response.json({ error: "Invalid JSON response" }, { status: 500 });
    }
    
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "API Error", details: 500 }, { status: 500 });
  }
}