# core/admin.py
from django.contrib import admin
from .models import Employee, Attendance,WorkSchedule

admin.site.register(Employee)
admin.site.register(Attendance)
admin.site.register(WorkSchedule)
