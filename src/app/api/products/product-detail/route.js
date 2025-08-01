export async function POST(request) {
  try {
    const body = await request.json();
    console.log('📋 [Product Detail] Request body:', body);
    
    const apiRequestBody = {
      model_id: body.model_id,
      size_id: body.size_id,
      color_id: body.color_id,
      material_id: body.material_id,
    };
    
    console.log('📤 [Product Detail] API request body:', apiRequestBody);
    
    const response = await fetch('http://62.181.44.89/api/products/product-detail/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(apiRequestBody),
    });

    console.log('📊 [Product Detail] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Product Detail] API error response:', errorText);
      console.error('❌ [Product Detail] API error status:', response.status);
      return Response.json({ error: "API Error", details: response.status, message: errorText }, { status: response.status });
    }

    const responseText = await response.text();
    console.log('📄 [Product Detail] Response text:', responseText);
    
    if (!responseText) {
      console.error('❌ [Product Detail] Empty response');
      return Response.json({ error: "Empty response from API" }, { status: 500 });
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ [Product Detail] Parsed data:', data);
      
      // Добавляем базовый URL к фотографиям только если они относительные
      if (data.photos && Array.isArray(data.photos)) {
        data.photos = data.photos.map(photo => ({
          ...photo,
          photo: photo.photo.startsWith('http') ? photo.photo : `http://62.181.44.89${photo.photo}`
        }));
      }
      
      // Добавляем title к размерам
      if (data.available_sizes && Array.isArray(data.available_sizes)) {
        data.available_sizes = data.available_sizes.map(size => ({
          ...size,
          title: size.value
        }));
      }
      
    } catch (parseError) {
      console.error('❌ [Product Detail] JSON parse error:', parseError);
      return Response.json({ error: "Invalid JSON response" }, { status: 500 });
    }
    
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching product details:', error);
    return Response.json({ error: "API Error", details: 500 }, { status: 500 });
  }
}