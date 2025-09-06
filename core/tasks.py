from core.models import Employee, Attendance
import jdatetime
from django.db import transaction
from celery import shared_task

@shared_task(bind=True)
def mark_absent_employees(self):
    today_jdate = jdatetime.date.today()
    created_count = 0

    existing_emp_ids = set(
        Attendance.objects.filter(date=today_jdate).values_list('employee_id', flat=True)
    )

    with transaction.atomic():
        for emp_id in Employee.objects.values_list('id', flat=True):
            if emp_id not in existing_emp_ids:
                Attendance.objects.create(
                    employee_id=emp_id,
                    date=today_jdate,
                    status=Attendance.Status.ABSENT.value,
                    check_in_time=None,
                    late_minutes=0
                )
                created_count += 1
                print(f"Marked absent: {emp_id}")

    print(f"Total absent marked: {created_count}")
    return {"created": created_count, "date": str(today_jdate)}
