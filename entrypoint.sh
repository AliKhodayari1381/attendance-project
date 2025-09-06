#!/bin/sh
# entrypoint.sh

# فقط برای Web اجرا می‌شود
if [ "$RUNNING_MODE" = "web" ]; then

    # صبر کردن تا DB آماده شود
    echo "Waiting for database..."
    while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
      sleep 1
    done
    echo "Database ready!"

    # اعمال migrations
    python manage.py migrate --noinput

    # جمع‌آوری فایل‌های static
    python manage.py collectstatic --noinput

    # ایجاد superuser اگر وجود ندارد
    echo "from django.contrib.auth import get_user_model; User = get_user_model(); \
if not User.objects.filter(username='admin').exists(): \
    User.objects.create_superuser('admin','admin@example.com','adminpass')" \
    | python manage.py shell

    # اجرای سرور Django
    exec python manage.py runserver 0.0.0.0:8000

else
    # برای Worker و Beat فقط دستور اصلی را اجرا کن
    exec "$@"
fi
