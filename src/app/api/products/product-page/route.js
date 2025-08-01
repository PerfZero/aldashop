export async function POST(request) {
  try {
    const body = await request.json();
    console.log('📋 [Product Page] Request body:', body);
    
    const apiRequestBody = {
      product_id: body.product_id,
    };
    
    console.log('📤 [Product Page] API request body:', apiRequestBody);
    
    const response = await fetch('http://62.181.44.89/api/products/product-page/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify(apiRequestBody),
    });

    console.log('📊 [Product Page] Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ [Product Page] API error response:', errorText);
      console.error('❌ [Product Page] API error status:', response.status);
      return Response.json({ error: "API Error", details: response.status, message: errorText }, { status: response.status });
    }

    const responseText = await response.text();
    console.log('📄 [Product Page] Response text:', responseText);
    
    if (!responseText) {
      console.error('❌ [Product Page] Empty response');
      return Response.json({ error: "Empty response from API" }, { status: 500 });
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ [Product Page] Parsed data:', data);
      
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
      console.error('❌ [Product Page] JSON parse error:', parseError);
      return Response.json({ error: "Invalid JSON response" }, { status: 500 });
    }
    
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching product page details:', error);
    return Response.json({ error: "API Error", details: 500 }, { status: 500 });
  }
} 