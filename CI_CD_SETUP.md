# Настройка CI/CD для автоматического деплоя

## 1. Настройка GitHub Secrets

Перейдите в настройки репозитория GitHub:
1. Settings → Secrets and variables → Actions
2. Добавьте следующие secrets:

```
SERVER_HOST = 62.181.44.89
SERVER_USER = root
SERVER_PASSWORD = dfgKfi93ekxljfoKLf0934K
```

## 2. Настройка сервера

### Установка скрипта деплоя на сервер:
```bash
# Подключитесь к серверу
ssh root@62.181.44.89

# Перейдите в папку проекта
cd /var/www/aldalinde

# Сделайте скрипт исполняемым
chmod +x deploy.sh
```

### Настройка Git на сервере:
```bash
# Настройте Git (если еще не настроен)
git config --global user.name "Server"
git config --global user.email "server@aldalinde.ru"

# Убедитесь, что репозиторий настроен правильно
git remote -v
```

## 3. Workflow файл

Создан файл `.github/workflows/deploy.yml` который:
- ✅ Запускается при push в main ветку
- ✅ Запускается вручную через GitHub Actions
- ✅ Сначала тестирует код (linting, build)
- ✅ Деплоит только если тесты прошли
- ✅ Автоматически обновляет сервер

## 4. Процесс деплоя

### Автоматический деплой:
1. Делаете изменения в коде
2. `git add .`
3. `git commit -m "Описание изменений"`
4. `git push origin main`
5. GitHub Actions автоматически:
   - Протестирует код
   - Задеплоит на сервер
   - Перезапустит приложение

### Ручной деплой:
1. Перейдите в GitHub → Actions
2. Выберите "Deploy to Server"
3. Нажмите "Run workflow"

## 5. Мониторинг

### Проверка статуса:
```bash
# На сервере
pm2 status
pm2 logs aldalinde
```

### Откат изменений:
```bash
# На сервере
cd /var/www/aldalinde
git log --oneline -5  # Посмотреть последние коммиты
git reset --hard HEAD~1  # Откатиться на 1 коммит назад
pm2 restart aldalinde
```

## 6. Полезные команды

```bash
# Посмотреть логи GitHub Actions
# GitHub → Actions → Deploy to Server

# Проверить статус на сервере
ssh root@62.181.44.89 "cd /var/www/aldalinde && pm2 status"

# Посмотреть логи приложения
ssh root@62.181.44.89 "pm2 logs aldalinde --lines 20"
```
