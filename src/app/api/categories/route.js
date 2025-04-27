    import { NextResponse } from 'next/server';

// Временные данные для демонстрации
const categories = {
  trending: {
    label: "В тренде",
    slug: "trending",
    subItems: [
      { label: "Новинки сезона", slug: "trending/new-season" },
      { label: "Бестселлеры", slug: "trending/bestsellers" },
      { label: "Скидки недели", slug: "trending/weekly-sales" },
    ],
  },
  sofas: {
    label: "Диваны",
    slug: "sofas",
    subItems: [
      { label: "Все диваны", slug: "sofas/all" },
      { label: "Прямые диваны", slug: "sofas/straight" },
      { label: "Угловые диваны", slug: "sofas/corner" },
      { label: "Модульные диваны", slug: "sofas/modular" },
      { label: "Диваны на ножках", slug: "sofas/with-legs" },
      { label: "Раскладные диваны", slug: "sofas/convertible" },
    ],
  },
  tables: {
    label: "Столы",
    slug: "tables",
    subItems: [
      { label: "Все столы", slug: "tables/all" },
      { label: "Обеденные столы", slug: "tables/dining" },
      { label: "Журнальные столы", slug: "tables/coffee" },
      { label: "Рабочие столы", slug: "tables/desk" },
      { label: "Прикроватные столы", slug: "tables/bedside" },
      { label: "Туалетные столики", slug: "tables/vanity" },
    ],
  },
  chairs: {
    label: "Стулья",
    slug: "chairs",
    subItems: [
      { label: "Все стулья", slug: "chairs/all" },
      { label: "Обеденные стулья", slug: "chairs/dining" },
      { label: "Кресла", slug: "chairs/armchairs" },
      { label: "Пуфы и банкетки", slug: "chairs/ottomans" },
      { label: "Барные стулья", slug: "chairs/bar" },
      { label: "Офисные стулья", slug: "chairs/office" },
    ],
  },
  beds: {
    label: "Кровати",
    slug: "beds",
    subItems: [
      { label: "Все кровати", slug: "beds/all" },
      { label: "Тумбы", slug: "beds/nightstands" },
      { label: "Комоды", slug: "beds/chests" },
      { label: "Прикроватные столики", slug: "beds/bedside-tables" },
      { label: "Пуфы и банкетки", slug: "beds/ottomans" },
    ],
  },
  storage: {
    label: "Хранение",
    slug: "storage",
    subItems: [
      { label: "Все", slug: "storage/all" },
      { label: "Шкафы", slug: "storage/wardrobes" },
      { label: "Комоды", slug: "storage/chests" },
      { label: "Тумбы", slug: "storage/stands" },
      { label: "Стеллажи", slug: "storage/shelves" },
      { label: "Мебель для TV", slug: "storage/tv-stands" },
      { label: "Полки", slug: "storage/bookcases" },
    ],
  },
  outdoor: {
    label: "Уличная мебель",
    slug: "outdoor",
    subItems: [
      { label: "Стулья", slug: "outdoor/chairs" },
      { label: "Столы", slug: "outdoor/tables" },
      { label: "Шезлонги", slug: "outdoor/sunbeds" },
      { label: "Качели", slug: "outdoor/swings" },
      { label: "Подвесные кресла", slug: "outdoor/hanging-chairs" },
    ],
  },
};

export async function GET() {
  return NextResponse.json(categories);
} 