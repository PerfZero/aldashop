# API: Регионы доставки

## Формат данных для бэкенда

Бэкенд должен передавать информацию о разрешенных регионах доставки в ответе API.

### Рекомендуемый endpoint

Добавить поле `delivery_regions` в ответ `/api/order/autocomplete/` или `/api/main-page-info/`

### Формат JSON

**Вариант 1: Простой (рекомендуется) - только названия регионов**

```json
{
  "delivery_regions": ["Москва", "Московская область", "Самарская область", "Самара"]
}
```

**Вариант 2: Полный - с ISO кодами и названиями**

```json
{
  "delivery_regions": [
    {
      "iso_code": "RU-MOS",
      "names": ["Московская область", "Московская обл."],
      "enabled": true
    },
    {
      "iso_code": "RU-MOW",
      "names": ["Москва", "Москва г"],
      "enabled": true
    },
    {
      "iso_code": "RU-SAM",
      "names": ["Самарская область", "Самара"],
      "enabled": true
    }
  ]
}
```

### Структура данных

**Простой формат (рекомендуется):**
- `delivery_regions` - массив строк с названиями регионов
- Пример: `["Москва", "Московская область", "Самарская область"]`

**Полный формат (опционально):**
- `delivery_regions` - массив объектов с полями:

| Поле | Тип | Обязательное | Описание |
|------|-----|--------------|----------|
| `iso_code` | string | Да | ISO 3166-2 код региона (формат: `RU-XXX`) |
| `names` | array[string] | Нет | Массив названий региона для проверки |
| `enabled` | boolean | Нет | Включен ли регион (по умолчанию `true`) |

### ISO коды регионов России

Полный список: https://ru.wikipedia.org/wiki/ISO_3166-2:RU

**Популярные регионы:**

| Регион | ISO код |
|--------|---------|
| Москва | `RU-MOW` |
| Московская область | `RU-MOS` |
| Санкт-Петербург | `RU-SPE` |
| Ленинградская область | `RU-LEN` |
| Краснодарский край | `RU-KDA` |
| Самарская область | `RU-SAM` |
| Новосибирская область | `RU-NVS` |
| Свердловская область | `RU-SVE` |
| Ростовская область | `RU-ROS` |
| Республика Татарстан | `RU-TA` |
| Нижегородская область | `RU-NIZ` |
| Челябинская область | `RU-CHE` |

### Пример полного ответа API

**Endpoint:** `GET /api/order/autocomplete/`

```json
{
  "profile_fields": {
    "first_name": "Иван",
    "last_name": "Иванов",
    "phone": "+79991234567"
  },
  "emails": ["user@example.com"],
  "delivery_addresses": [],
  "pickup_addresses": [
    {
      "id": 1,
      "full_address": "ул. Кипарисовая, 56"
    }
  ],
  "legal_persons": [],
  "can_edit_profile": true,
  "delivery_regions": ["Москва", "Московская область", "Самарская область", "Самара"]
}
```

### Альтернативный вариант: отдельный endpoint

Если не хотите добавлять в существующие endpoints, можно создать:

**Endpoint:** `GET /api/delivery-regions/`

**Ответ:**
```json
{
  "delivery_regions": ["Москва", "Московская область", "Самарская область"]
}
```

### Важные замечания

1. **Простой формат (рекомендуется)** - просто массив строк с названиями регионов. Фронтенд сам определит ISO коды для ограничения границ карты.

2. **Полный формат (опционально)** - если нужен контроль ISO кодов, используйте объекты с полями `iso_code`, `names`, `enabled`.

3. **Ограничение работает через границы карты** - пользователь физически не может выбрать точку вне разрешенных регионов благодаря `restrictMapArea`.

4. **Проверка по названиям** - при выборе адреса проверяется соответствие названия региона/города из геокодера.

5. **Если `delivery_regions` отсутствует** в ответе, фронтенд будет использовать значения по умолчанию (Москва, Московская область и Самарская область).

### Пример реализации на Django

**Простой вариант (рекомендуется):**

```python
# views.py
class OrderAutocompleteView(APIView):
    def get(self, request):
        # ... существующий код ...
        
        delivery_regions = ['Москва', 'Московская область', 'Самарская область', 'Самара']
        
        return Response({
            # ... существующие поля ...
            'delivery_regions': delivery_regions
        })
```

**Или из базы данных:**

```python
# models.py
class DeliveryRegion(models.Model):
    name = models.CharField(max_length=100, unique=True)
    enabled = models.BooleanField(default=True)

# views.py
class OrderAutocompleteView(APIView):
    def get(self, request):
        delivery_regions = list(
            DeliveryRegion.objects.filter(enabled=True).values_list('name', flat=True)
        )
        
        return Response({
            'delivery_regions': delivery_regions
        })
```

### Пример реализации на Laravel

**Простой вариант (рекомендуется):**

```php
// Controller
public function autocomplete(Request $request)
{
    $deliveryRegions = ['Москва', 'Московская область', 'Самарская область', 'Самара'];
    
    return response()->json([
        'delivery_regions' => $deliveryRegions
    ]);
}
```

**Или из базы данных:**

```php
// Migration
Schema::create('delivery_regions', function (Blueprint $table) {
    $table->id();
    $table->string('name', 100)->unique();
    $table->boolean('enabled')->default(true);
    $table->timestamps();
});

// Model
class DeliveryRegion extends Model
{
    protected $fillable = ['name', 'enabled'];
}

// Controller
public function autocomplete(Request $request)
{
    $deliveryRegions = DeliveryRegion::where('enabled', true)
        ->pluck('name')
        ->toArray();
    
    return response()->json([
        'delivery_regions' => $deliveryRegions
    ]);
}
```

