# API Документация - Страница категорий

## Получение информации о категории
`GET /api/categories/{slug}`

Возвращает информацию о категории по её slug.

### Параметры пути
| Параметр | Тип | Описание |
|----------|-----|----------|
| slug | string | Идентификатор категории (например, "sofas", "tables") |

### Ответ
```json
{
  "category": {
    "id": "string",
    "label": "string",
    "slug": "string",
    "description": "string",
    "image": {
      "src": "string",
      "alt": "string"
    },
    "parentCategory": {
      "id": "string",
      "label": "string",
      "slug": "string"
    }
  }
}
```

### Пример ответа
```json
{
  "category": {
    "id": "sofas",
    "label": "Диваны",
    "slug": "sofas",
    "description": "У нас вы найдете идеальные диваны для любого интерьера: от компактных 2-местных моделей до просторных угловых вариантов. Мягкие, как облако, или умеренно жесткие — выбирайте комфорт на каждый день!",
    "image": {
      "src": "/category.png",
      "alt": "Диваны"
    },
    "parentCategory": null
  }
}
```

## Получение товаров категории
`GET /api/categories/{slug}/products`

Возвращает список товаров в категории с возможностью фильтрации и сортировки.

### Параметры пути
| Параметр | Тип | Описание |
|----------|-----|----------|
| slug | string | Идентификатор категории (например, "sofas", "tables") |

### Параметры запроса
| Параметр | Тип | Описание |
|----------|-----|----------|
| page | number | Номер страницы (по умолчанию 1) |
| limit | number | Количество товаров на странице (по умолчанию 12) |
| sort | string | Поле для сортировки (например, "price-asc", "price-desc", "recommended") |
| inStock | boolean | Фильтр по наличию товара (true/false) |
| priceMin | number | Минимальная цена |
| priceMax | number | Максимальная цена |
| size | string | Фильтр по размеру (например, "80x200 см") |
| material | string | Фильтр по материалу (например, "шенилл") |
| color | string | Фильтр по цвету (например, "Бежевый") |
| designer | boolean | Фильтр по дизайнерам (true/false) |
| convertible | boolean | Фильтр по раскладным моделям (true/false) |
| sleepSize | string | Фильтр по размеру спального места (например, "200 см") |
| purpose | string | Фильтр по назначению (например, "Гостиная") |
| form | string | Фильтр по форме (например, "Прямой") |
| withDrawers | boolean | Фильтр по наличию ящиков (true/false) |
| brand | string | Фильтр по бренду (например, "ALDA") |
| country | string | Фильтр по стране производителю (например, "Россия") |

### Ответ
```json
{
  "products": [
    {
      "id": "string",
      "name": "string",
      "article": "string",
      "price": "string",
      "image": "string",
      "hoverImage": "string",
      "isBestseller": boolean,
      "discount": number,
      "sizes": ["string"],
      "materials": ["string"],
      "colors": [
        {
          "name": "string",
          "hex": "string"
        }
      ]
    }
  ],
  "pagination": {
    "total": number,
    "page": number,
    "limit": number,
    "pages": number
  }
}
```

### Пример ответа
```json
{
  "products": [
    {
      "id": 1,
      "name": "Диван-кровать Скаген бежевого цвета",
      "article": "IMR-1798647",
      "price": "25 000",
      "image": "/sofa.png",
      "hoverImage": "/sofa1-hover.jpg",
      "isBestseller": true,
      "discount": 15,
      "sizes": ["80x200 см", "90x300 см", "90x300 см"],
      "materials": ["шенилл", "гобелен", "рогожка"],
      "colors": [
        { "name": "Бежевый", "hex": "#E8D0B3" },
        { "name": "Серый", "hex": "#A0A0A0" },
        { "name": "Коричневый", "hex": "#8B4513" }
      ]
    },
    {
      "id": 2,
      "name": "Диван-кровать Модерн",
      "article": "IMR-1798648",
      "price": "32 000",
      "image": "/sofa.png",
      "hoverImage": "/sofa2-hover.jpg",
      "isBestseller": false,
      "sizes": ["90x200 см", "100x300 см"],
      "materials": ["экокожа", "велюр"],
      "colors": [
        { "name": "Черный", "hex": "#000000" },
        { "name": "Белый", "hex": "#FFFFFF" },
        { "name": "Серый", "hex": "#808080" }
      ]
    }
  ],
  "pagination": {
    "total": 9,
    "page": 1,
    "limit": 12,
    "pages": 1
  }
}
```

## Получение фильтров для категории
`GET /api/categories/{slug}/filters`

Возвращает доступные фильтры для категории.

### Параметры пути
| Параметр | Тип | Описание |
|----------|-----|----------|
| slug | string | Идентификатор категории (например, "sofas", "tables") |

### Ответ
```json
{
  "filters": {
    "main": [
      {
        "id": "string",
        "title": "string",
        "type": "string",
        "options": [
          {
            "value": "string",
            "label": "string"
          }
        ]
      }
    ],
    "additional": [
      {
        "id": "string",
        "title": "string",
        "type": "string",
        "options": [
          {
            "value": "string",
            "label": "string"
          }
        ]
      }
    ]
  }
}
```

### Пример ответа
```json
{
  "filters": {
    "main": [
      {
        "id": "price",
        "title": "Цена",
        "type": "range",
        "min": 0,
        "max": 100000
      },
      {
        "id": "size",
        "title": "Размер",
        "type": "select",
        "options": [
          { "value": "80x200 см", "label": "80x200 см" },
          { "value": "90x200 см", "label": "90x200 см" },
          { "value": "90x300 см", "label": "90x300 см" },
          { "value": "100x300 см", "label": "100x300 см" }
        ]
      },
      {
        "id": "colors",
        "title": "Популярные цвета",
        "type": "colors",
        "options": [
          { "value": "Бежевый", "label": "Бежевый", "hex": "#E8D0B3" },
          { "value": "Серый", "label": "Серый", "hex": "#A0A0A0" },
          { "value": "Коричневый", "label": "Коричневый", "hex": "#8B4513" },
          { "value": "Черный", "label": "Черный", "hex": "#000000" },
          { "value": "Белый", "label": "Белый", "hex": "#FFFFFF" }
        ]
      },
      {
        "id": "material",
        "title": "Материал обивки",
        "type": "select",
        "options": [
          { "value": "шенилл", "label": "Шенилл" },
          { "value": "гобелен", "label": "Гобелен" },
          { "value": "рогожка", "label": "Рогожка" },
          { "value": "экокожа", "label": "Экокожа" },
          { "value": "велюр", "label": "Велюр" }
        ]
      },
      {
        "id": "convertible",
        "title": "Раскладной",
        "type": "checkbox"
      },
      {
        "id": "sleepSize",
        "title": "Размер спального места",
        "type": "select",
        "options": [
          { "value": "200 см", "label": "200 см" },
          { "value": "300 см", "label": "300 см" }
        ]
      }
    ],
    "additional": [
      {
        "id": "purpose",
        "title": "Назначение",
        "type": "select",
        "options": [
          { "value": "Гостиная", "label": "Гостиная" },
          { "value": "Спальня", "label": "Спальня" },
          { "value": "Детская", "label": "Детская" }
        ]
      },
      {
        "id": "form",
        "title": "Форма",
        "type": "select",
        "options": [
          { "value": "Прямой", "label": "Прямой" },
          { "value": "Угловой", "label": "Угловой" },
          { "value": "П-образный", "label": "П-образный" }
        ]
      },
      {
        "id": "withDrawers",
        "title": "С ящиками",
        "type": "checkbox"
      },
      {
        "id": "brand",
        "title": "Бренды",
        "type": "select",
        "options": [
          { "value": "ALDA", "label": "ALDA" },
          { "value": "Comfort", "label": "Comfort" },
          { "value": "HomeStyle", "label": "HomeStyle" }
        ]
      },
      {
        "id": "country",
        "title": "Страна производитель",
        "type": "select",
        "options": [
          { "value": "Россия", "label": "Россия" },
          { "value": "Беларусь", "label": "Беларусь" },
          { "value": "Китай", "label": "Китай" }
        ]
      }
    ]
  }
}
```

## Получение хлебных крошек для категории
`GET /api/categories/{slug}/breadcrumbs`

Возвращает хлебные крошки для категории.

### Параметры пути
| Параметр | Тип | Описание |
|----------|-----|----------|
| slug | string | Идентификатор категории (например, "sofas", "tables") |

### Ответ
```json
{
  "breadcrumbs": [
    {
      "text": "string",
      "href": "string"
    }
  ]
}
```

### Пример ответа
```json
{
  "breadcrumbs": [
    { "text": "Главная", "href": "/" },
    { "text": "Диваны", "href": "/categories/sofas" },
    { "text": "Все диваны", "href": "/categories/sofas/all" }
  ]
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
    "message": "Категория не найдена"
  }
}
``` 