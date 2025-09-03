export async function POST(request) {
  try {
    const body = await request.json();
    
    const apiRequestBody = {
      product_id: body.product_id,
    };
    
    const response = await fetch('https://aldalinde.ru/api/products/product-page/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
      },
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
      
      // Получаем количество отзывов для продукта
      try {
        const reviewsResponse = await fetch(`https://aldalinde.ru/api/products/reviews/${body.product_id}/?limit=1&page=1`);
        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();
          data.reviews_count = reviewsData.count || 0;
        }
      } catch (reviewsError) {
        console.error('Ошибка получения количества отзывов:', reviewsError);
        data.reviews_count = 0;
      }
      
      // Добавляем базовый URL к фотографиям только если они относительные
      if (data.photos && Array.isArray(data.photos)) {
        data.photos = data.photos.map(photo => ({
          ...photo,
          photo: photo.photo.startsWith('http') ? photo.photo : `https://aldalinde.ru${photo.photo}`
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
      return Response.json({ error: "Invalid JSON response" }, { status: 500 });
    }
    
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "API Error", details: 500 }, { status: 500 });
  }
} 