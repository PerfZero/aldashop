export async function POST(request) {
  try {
    console.log('=== REVIEW CREATE API START ===');
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      console.log('Ошибка: нет заголовка авторизации');
      return Response.json({ error: 'Не авторизован' }, { status: 401 });
    }
    
    const formData = await request.formData();
    console.log('FormData получен');
    
    const productId = formData.get('product_id');
    const rate = formData.get('rate');
    const title = formData.get('title');
    const message = formData.get('message');
    const photos = formData.getAll('photos');
    
    console.log('Данные из FormData:', {
      productId,
      rate,
      title,
      message,
      photosCount: photos.length
    });
    
    if (!productId || !rate || !title || !message) {
      console.log('Ошибка: отсутствуют обязательные поля');
      return Response.json({ 
        error: 'Отсутствуют обязательные поля: product_id, rate, title, message' 
      }, { status: 400 });
    }
    
    if (rate < 1 || rate > 5) {
      return Response.json({ 
        error: 'Оценка должна быть от 1 до 5' 
      }, { status: 400 });
    }
    
    if (title.length > 100) {
      return Response.json({ 
        error: 'Заголовок отзыва не должен превышать 100 символов' 
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
      title: title,
      message: message,
      photos: photos
    };
    
    const formDataToSend = new FormData();
    formDataToSend.append('product_id', productId);
    formDataToSend.append('rate', rate);
    formDataToSend.append('title', title);
    formDataToSend.append('message', message);
    
    photos.forEach((photo, index) => {
      formDataToSend.append('photos', photo);
      console.log(`Добавлена фотография ${index}:`, photo.name || 'без имени');
    });

    console.log('Отправляем запрос на внешний API...');
    const response = await fetch('https://aldalinde.ru/api/user/reviews/create/', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': authHeader,
      },
      body: formDataToSend,
    });
    
    console.log('Ответ от внешнего API:', response.status, response.statusText);
    const responseText = await response.text();
    console.log('Текст ответа:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Распарсенные данные:', data);
    } catch (parseError) {
      console.log('Ошибка парсинга JSON:', parseError);
      return Response.json({ 
        error: 'Ошибка парсинга ответа сервера',
        details: responseText 
      }, { status: response.status });
    }
    
    if (!response.ok) {
      console.log('Ошибка ответа от внешнего API:', response.status);
      if (data.code === 'token_not_valid') {
        console.log('Токен недействителен');
        return Response.json({ error: 'Токен недействителен. Пожалуйста, войдите заново.' }, { status: 401 });
      }
      
      // Проверяем на дублирование отзыва
      if (responseText.includes('unique_review_per_product_and_user') || 
          responseText.includes('duplicate key value violates unique constraint')) {
        console.log('Дублирование отзыва');
        return Response.json({ 
          error: 'Вы уже оставили отзыв на этот товар. Один пользователь может оставить только один отзыв на товар.' 
        }, { status: 400 });
      }
      
      return Response.json(data, { status: response.status });
    }
    
    console.log('Отзыв успешно создан');
    return Response.json(data, { status: 201 });
  } catch (error) {
    console.log('Внутренняя ошибка сервера:', error);
    return Response.json({ 
      error: 'Внутренняя ошибка сервера',
      details: error.message 
    }, { status: 500 });
  }
}
