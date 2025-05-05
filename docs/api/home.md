# API Документация - Главная страница

## Получение секций главной страницы
`GET /api/home/sections`

Возвращает данные для отображения секций на главной странице.

### Ответ
```json
{
  "sections": [
    {
      "id": "string",
      "type": "string",
      "title": "string",
      "description": "string",
      "image": {
        "src": "string",
        "alt": "string",
        "width": number,
        "height": number
      },
      "button": {
        "text": "string",
        "link": "string"
      },
      "layout": "string"
    }
  ]
}
```

### Пример ответа
```json
{
  "sections": [
    {
      "id": "1",
      "type": "image-text",
      "title": "Максимум комфорта в минимуме места",
      "description": "Компактная мебель для вашего дома",
      "image": {
        "src": "/pic_1.png",
        "alt": "Комфортная мебель",
        "width": 600,
        "height": 400
      },
      "button": {
        "text": "Выбрать компактный комфорт",
        "link": "/products"
      },
      "layout": "image-left"
    },
    {
      "id": "2",
      "type": "two-rows",
      "rows": [
        {
          "title": "Максимум комфорта в минимуме",
          "image": {
            "src": "/pic_2.png",
            "alt": "Комфортная мебель",
            "width": 600,
            "height": 400
          },
          "button": {
            "text": "Выбрать компактный комфорт",
            "link": "/products"
          }
        },
        {
          "title": "Максимум комфорта в минимуме",
          "image": {
            "src": "/pic_2.png",
            "alt": "Комфортная мебель",
            "width": 600,
            "height": 400
          },
          "button": {
            "text": "Выбрать компактный комфорт",
            "link": "/products"
          }
        }
      ]
    },
    {
      "id": "3",
      "type": "image-text",
      "title": "Максимум комфорта в минимуме места",
      "description": "Компактная мебель для вашего дома",
      "image": {
        "src": "/pic_1.png",
        "alt": "Комфортная мебель",
        "width": 600,
        "height": 400
      },
      "button": {
        "text": "Выбрать компактный комфорт",
        "link": "/products"
      },
      "layout": "image-right"
    }
  ]
}
```

## Получение баннеров
`GET /api/home/banners`

Возвращает данные для отображения баннеров на главной странице.

### Ответ
```json
{
  "banners": [
    {
      "id": "string",
      "title": "string",
      "description": "string",
      "image": {
        "src": "string",
        "alt": "string",
        "width": number,
        "height": number
      },
      "button": {
        "text": "string",
        "link": "string"
      },
      "position": "string"
    }
  ]
}
```

### Пример ответа
```json
{
  "banners": [
    {
      "id": "1",
      "title": "Новинки сезона",
      "description": "Ознакомьтесь с новыми коллекциями",
      "image": {
        "src": "/banners/new-season.jpg",
        "alt": "Новинки сезона",
        "width": 1200,
        "height": 400
      },
      "button": {
        "text": "Смотреть новинки",
        "link": "/products/new"
      },
      "position": "top"
    },
    {
      "id": "2",
      "title": "Специальные предложения",
      "description": "Скидки до 30% на выбранные товары",
      "image": {
        "src": "/banners/special-offers.jpg",
        "alt": "Специальные предложения",
        "width": 1200,
        "height": 400
      },
      "button": {
        "text": "Перейти к акциям",
        "link": "/products/sale"
      },
      "position": "middle"
    }
  ]
}
```

## Получение популярных категорий
`GET /api/home/popular-categories`

Возвращает данные о популярных категориях для отображения на главной странице.

### Ответ
```json
{
  "categories": [
    {
      "id": "string",
      "label": "string",
      "slug": "string",
      "image": {
        "src": "string",
        "alt": "string",
        "width": number,
        "height": number
      },
      "productCount": number
    }
  ]
}
```

### Пример ответа
```json
{
  "categories": [
    {
      "id": "sofas",
      "label": "Диваны",
      "slug": "sofas",
      "image": {
        "src": "/categories/sofas.jpg",
        "alt": "Диваны",
        "width": 300,
        "height": 200
      },
      "productCount": 42
    },
    {
      "id": "tables",
      "label": "Столы",
      "slug": "tables",
      "image": {
        "src": "/categories/tables.jpg",
        "alt": "Столы",
        "width": 300,
        "height": 200
      },
      "productCount": 38
    },
    {
      "id": "chairs",
      "label": "Стулья",
      "slug": "chairs",
      "image": {
        "src": "/categories/chairs.jpg",
        "alt": "Стулья",
        "width": 300,
        "height": 200
      },
      "productCount": 56
    }
  ]
}
```

## Получение новинок
`GET /api/home/new-arrivals`

Возвращает данные о новых поступлениях товаров для отображения на главной странице.

### Параметры запроса
| Параметр | Тип | Описание |
|----------|-----|----------|
| limit | number | Количество товаров (по умолчанию 8) |

### Ответ
```json
{
  "products": [
    {
      "id": "string",
      "name": "string",
      "price": number,
      "oldPrice": number,
      "image": {
        "src": "string",
        "alt": "string",
        "width": number,
        "height": number
      },
      "category": {
        "id": "string",
        "label": "string",
        "slug": "string"
      },
      "isNew": boolean,
      "isSale": boolean
    }
  ],
  "total": number
}
```

### Пример ответа
```json
{
  "products": [
    {
      "id": "1",
      "name": "Диван прямой",
      "price": 59990,
      "oldPrice": 69990,
      "image": {
        "src": "/products/sofa-1.jpg",
        "alt": "Диван прямой",
        "width": 300,
        "height": 200
      },
      "category": {
        "id": "sofas",
        "label": "Диваны",
        "slug": "sofas"
      },
      "isNew": true,
      "isSale": true
    },
    {
      "id": "2",
      "name": "Обеденный стол",
      "price": 29990,
      "oldPrice": null,
      "image": {
        "src": "/products/table-1.jpg",
        "alt": "Обеденный стол",
        "width": 300,
        "height": 200
      },
      "category": {
        "id": "tables",
        "label": "Столы",
        "slug": "tables"
      },
      "isNew": true,
      "isSale": false
    }
  ],
  "total": 2
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
    "code": "404",
    "message": "Секции не найдены"
  }
}
``` 