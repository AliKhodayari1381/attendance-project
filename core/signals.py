from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django_celery_beat.models import CrontabSchedule, PeriodicTask
from .models import WorkSchedule
import json

TASK_NAME = 'Mark absent employees daily'
TASK_PATH = 'core.tasks.mark_absent_employees'

def _ensure_periodic_task_for_end_time(end_time):
    
    hour = str(end_time.hour)
    minute = str(end_time.minute)
    tzname = timezone.get_current_timezone_name()

    cron, _ = CrontabSchedule.objects.get_or_create(
        minute=minute,
        hour=hour,
        day_of_week='*',
        day_of_month='*',
        month_of_year='*',
        timezone=tzname,  
    )

    task, created = PeriodicTask.objects.get_or_create(
        name=TASK_NAME,
        defaults={
            'task': TASK_PATH,
            'crontab': cron,
            'enabled': True,
            'args': json.dumps([]),
            'kwargs': json.dumps({}),
        },
    )
    if not created:
        # به‌روزرسانی زمان‌بند در صورت تغییر ساعت
        changed = False
        if task.crontab != cron:
            task.crontab = cron
            changed = True
        if not task.enabled:
            task.enabled = True
            changed = True
        if changed:
            task.save()

@receiver(post_save, sender=WorkSchedule)
def sync_absence_task_schedule(sender, instance, **kwargs):
    _ensure_periodic_task_for_end_time(instance.end_time)
