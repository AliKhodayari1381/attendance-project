#!/bin/sh
if [ "$RUNNING_MODE" = "web" ]; then

    echo "Waiting for database..."
    while ! nc -z $POSTGRES_HOST $POSTGRES_PORT; do
      sleep 1
    done
    echo "Database ready!"

    # اعمال migrations
    python manage.py migrate --noinput

    # جمع‌آوری فایل‌های static
    python manage.py collectstatic --noinput

    echo "from django.contrib.auth import get_user_model; User = get_user_model(); \
if not User.objects.filter(username='admin').exists(): \
    User.objects.create_superuser('adminuser','admin@example.com','adminpass')" \
    | python manage.py shell

    # اجرای سرور Django
    exec python manage.py runserver 0.0.0.0:8000

else
    exec "$@"
fi
