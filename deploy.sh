#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Начинаем деплой...${NC}"

# Переходим в папку проекта
cd /var/www/aldalinde

echo -e "${YELLOW}📥 Получаем последние изменения...${NC}"
git pull origin main

echo -e "${YELLOW}📦 Устанавливаем зависимости...${NC}"
npm ci

echo -e "${YELLOW}🛑 Останавливаем приложение...${NC}"
pm2 stop aldalinde || true

echo -e "${YELLOW}🔨 Собираем проект...${NC}"
npm run build

echo -e "${YELLOW}▶️ Запускаем приложение...${NC}"
pm2 start npm --name "aldalinde" -- run start

echo -e "${YELLOW}💾 Сохраняем конфигурацию PM2...${NC}"
pm2 save

echo -e "${GREEN}✅ Деплой завершен успешно!${NC}"

echo -e "${YELLOW}📊 Статус приложения:${NC}"
pm2 status
