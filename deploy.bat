@echo off
echo 🚀 Partners Frontend - Quick Deploy
echo.

echo 📝 Добавляем изменения...
git add .

echo.
echo 💬 Введите описание изменений:
set /p commit_message="Commit message: "

echo.
echo 💾 Коммитим изменения...
git commit -m "%commit_message%"

echo.
echo 🌐 Загружаем на GitHub...
git push

echo.
echo ✅ Готово! Изменения будут применены на bk-partners.ru
echo.
echo 🔗 Проверьте сайт: https://bk-partners.ru
echo.
pause
