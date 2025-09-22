# API Документация - Хедер

## Получение категорий
`GET https://aldalinde.ru/api/products/category-list/`

Возвращает список всех категорий с подкатегориями для отображения в хедере.

### Ответ
```json
{
  "categories": {
    "trending": {
      "label": "string",
      "slug": "string",
      "subItems": [
        {
          "label": "string",
          "slug": "string"
        }
      ]
    }
  }
}
```

### Пример ответа
```json
{
  "categories": {
    "trending": {
      "label": "В тренде",
      "slug": "trending",
      "subItems": [
        {
          "label": "Новинки сезона",
          "slug": "trending/new-season"
        },
        {
          "label": "Бестселлеры",
          "slug": "trending/bestsellers"
        }
      ]
    },
    "sofas": {
      "label": "Диваны",
      "slug": "sofas",
      "subItems": [
        {
          "label": "Все диваны",
          "slug": "sofas/all"
        },
        {
          "label": "Прямые диваны",
          "slug": "sofas/straight"
        }
      ]
    }
  }
}
```

## Поиск товаров
`GET /api/search`

Поиск товаров по запросу пользователя.

### Параметры запроса
| Параметр | Тип | Описание |
|----------|-----|----------|
| q | string | Поисковый запрос |
| limit | number | Количество результатов (по умолчанию 10) |

### Ответ
```json
{
  "results": [
    {
      "id": "string",
      "name": "string",
      "price": number,
      "image": "string",
      "category": {
        "id": "string",
        "label": "string",
        "slug": "string"
      }
    }
  ],
  "total": number
}
```

### Пример ответа
```json
{
  "results": [
    {
      "id": "1",
      "name": "Диван прямой",
      "price": 59990,
      "image": "/images/products/sofa-1.jpg",
      "category": {
        "id": "sofas",
        "label": "Диваны",
        "slug": "sofas"
      }
    }
  ],
  "total": 1
}
```

## Авторизация пользователя
`POST /api/auth/login`

Авторизация пользователя в системе.

### Тело запроса
```json
{
  "email": "string",
  "password": "string"
}
```

### Ответ
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "avatar": "string"
  }
}
```

### Пример ответа
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "Иван Иванов",
    "avatar": "/images/avatars/user-1.jpg"
  }
}
```

## Получение данных пользователя
`GET /api/user/profile`

Получение данных авторизованного пользователя.

### Заголовки
| Заголовок | Значение |
|-----------|----------|
| Authorization | Bearer {token} |

### Ответ
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "avatar": "string"
}
```

### Пример ответа
```json
{
  "id": "1",
  "email": "user@example.com",
  "name": "Иван Иванов",
  "avatar": "/images/avatars/user-1.jpg"
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
| 404 | Ресурс не найден |
| 500 | Внутренняя ошибка сервера |

### Пример ошибки
```json
{
  "error": {
    "code": "401",
    "message": "Неверные учетные данные"
  }
}
``` 