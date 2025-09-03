export async function POST(request) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return Response.json({ error: 'Не авторизован' }, { status: 401 });
    }
    
    const formData = await request.formData();
    
    const productId = formData.get('product_id');
    const rate = formData.get('rate');
    const message = formData.get('message');
    const photos = formData.getAll('photos');
    
    if (!productId || !rate || !message) {
      return Response.json({ 
        error: 'Отсутствуют обязательные поля: product_id, rate, message' 
      }, { status: 400 });
    }
    
    if (rate < 1 || rate > 5) {
      return Response.json({ 
        error: 'Оценка должна быть от 1 до 5' 
      }, { status: 400 });
    }
    
    if (message.length > 400) {
      return Response.json({ 
        error: 'Текст отзыва не должен превышать 400 символов' 
      }, { status: 400 });
    }
    
    if (photos && photos.length > 3) {
      return Response.json({ 
        error: 'Максимум 3 фотографии' 
      }, { status: 400 });
    }
    
    const requestBody = {
      product_id: parseInt(productId),
      rate: parseInt(rate),
      message: message,
      photos: photos
    };
    
    const response = await fetch('https://aldalinde.ru/api/user/reviews/create/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'accept': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(requestBody),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      if (data.code === 'token_not_valid') {
        return Response.json({ error: 'Токен недействителен. Пожалуйста, войдите заново.' }, { status: 401 });
      }
      return Response.json(data, { status: response.status });
    }
    
    return Response.json(data, { status: 201 });
  } catch (error) {
    return Response.json({ 
      error: 'Внутренняя ошибка сервера',
      details: error.message 
    }, { status: 500 });
  }
}
