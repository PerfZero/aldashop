# API Документация - Страница товара

## Получение информации о товаре
`GET /api/products/{id}`

Возвращает подробную информацию о товаре по его ID.

### Параметры пути
| Параметр | Тип | Описание |
|----------|-----|----------|
| id | string | Идентификатор товара |

### Ответ
```json
{
  "product": {
    "id": "string",
    "name": "string",
    "article": "string",
    "price": "string",
    "isBestseller": boolean,
    "rating": number,
    "reviewsCount": number,
    "images": ["string"],
    "colors": [
      {
        "name": "string",
        "hex": "string"
      }
    ],
    "sizes": ["string"],
    "manufacturingTime": "string",
    "weight": "string",
    "material": "string",
    "country": "string",
    "delivery": "string",
    "description": "string"
  }
}
```

### Пример ответа
```json
{
  "product": {
    "id": "1",
    "name": "Диван-кровать Скаген бежевого цвета",
    "article": "IMR-1798647",
    "price": "25 000",
    "isBestseller": true,
    "rating": 4,
    "reviewsCount": 420,
    "images": [
      "/prod.png",
      "/prod.png",
      "/prod.png",
      "/prod.png",
      "/prod.png"
    ],
    "colors": [
      { "name": "Бежевый", "hex": "#E8D0B3" },
      { "name": "Серый", "hex": "#A0A0A0" },
      { "name": "Коричневый", "hex": "#8B4513" },
      { "name": "Синий", "hex": "#4169E1" }
    ],
    "sizes": [
      "235х90х155 см",
      "235х90х152 см",
      "235х90х154 см"
    ],
    "manufacturingTime": "от 60-ти дней",
    "weight": "80 кг",
    "material": "Велюр",
    "country": "Новосибирск",
    "delivery": "Доставка в город, по России и в СНГ",
    "description": "Мягкая кровать-тахта Milena (Милена) с ортопедическим основанием..."
  }
}
```

## Получение отзывов о товаре
`GET /api/products/{id}/reviews`

Возвращает отзывы о товаре с возможностью пагинации.

### Параметры пути
| Параметр | Тип | Описание |
|----------|-----|----------|
| id | string | Идентификатор товара |

### Параметры запроса
| Параметр | Тип | Описание |
|----------|-----|----------|
| page | number | Номер страницы (по умолчанию 1) |
| limit | number | Количество отзывов на странице (по умолчанию 10) |
| sort | string | Поле для сортировки (например, "date-desc", "rating-desc") |

### Ответ
```json
{
  "reviews": [
    {
      "id": "string",
      "author": "string",
      "rating": number,
      "date": "string",
      "text": "string",
      "images": ["string"],
      "likes": number,
      "dislikes": number
    }
  ],
  "pagination": {
    "total": number,
    "page": number,
    "limit": number,
    "pages": number
  },
  "summary": {
    "averageRating": number,
    "totalReviews": number,
    "ratingDistribution": {
      "5": number,
      "4": number,
      "3": number,
      "2": number,
      "1": number
    }
  }
}
```

### Пример ответа
```json
{
  "reviews": [
    {
      "id": "1",
      "author": "Анна",
      "rating": 5,
      "date": "2024-04-15",
      "text": "Отличный диван! Очень удобный и качественный.",
      "images": ["/review1.jpg", "/review2.jpg"],
      "likes": 12,
      "dislikes": 0
    }
  ],
  "pagination": {
    "total": 420,
    "page": 1,
    "limit": 10,
    "pages": 42
  },
  "summary": {
    "averageRating": 4.5,
    "totalReviews": 420,
    "ratingDistribution": {
      "5": 250,
      "4": 120,
      "3": 30,
      "2": 15,
      "1": 5
    }
  }
}
```

## Добавление товара в корзину
`POST /api/products/{id}/cart`

Добавляет товар в корзину пользователя.

### Параметры пути
| Параметр | Тип | Описание |
|----------|-----|----------|
| id | string | Идентификатор товара |

### Тело запроса
```json
{
  "color": "string",
  "size": "string",
  "quantity": number
}
```

### Ответ
```json
{
  "success": boolean,
  "cart": {
    "items": [
      {
        "id": "string",
        "name": "string",
        "price": "string",
        "color": "string",
        "size": "string",
        "quantity": number,
        "image": "string"
      }
    ],
    "total": "string"
  }
}
```

### Пример ответа
```json
{
  "success": true,
  "cart": {
    "items": [
      {
        "id": "1",
        "name": "Диван-кровать Скаген бежевого цвета",
        "price": "25 000",
        "color": "Бежевый",
        "size": "235х90х155 см",
        "quantity": 1,
        "image": "/prod.png"
      }
    ],
    "total": "25 000"
  }
}
```

## Добавление товара в избранное
`POST /api/products/{id}/favorite`

Добавляет или удаляет товар из избранного пользователя.

### Параметры пути
| Параметр | Тип | Описание |
|----------|-----|----------|
| id | string | Идентификатор товара |

### Ответ
```json
{
  "success": boolean,
  "isFavorite": boolean
}
```

### Пример ответа
```json
{
  "success": true,
  "isFavorite": true
}
```

## Обработка ошибок

Все API методы возвращают ошибки в следующем формате:

```json
{
  "error": {
    "code": "string",
    "message": "string"
  }
}
```

### Коды ошибок
| Код | Описание |
|-----|----------|
| 400 | Неверный запрос |
| 401 | Не авторизован |
| 403 | Доступ запрещен |
| 404 | Товар не найден |
| 500 | Внутренняя ошибка сервера |

### Пример ошибки
```json
{
  "error": {
    "code": "404",
    "message": "Товар не найден"
  }
}
``` 