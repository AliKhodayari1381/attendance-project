#!/bin/sh
set -e
until python manage.py migrate --noinput; do
  echo "Waiting for db..."
  sleep 1
done
python manage.py collectstatic --noinput
exec gunicorn attendance.wsgi:application --bind 0.0.0.0:8000