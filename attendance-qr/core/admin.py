from django.contrib import admin
from .models import Employee, Attendance, WorkSchedule
from django.utils.html import format_html

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ('employee_id', 'first_name', 'last_name', 'qr_code_tag')
    search_fields = ('first_name', 'last_name', 'employee_id')
    ordering = ('last_name',)
    readonly_fields = ('qr_code_tag',)

    def qr_code_tag(self, obj):
        if obj.qr_code:
            return format_html('<img src="{}" width="100" height="100" />', obj.qr_code.url)
        return "-"
    qr_code_tag.short_description = "QR Code"


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'status', 'late_minutes', 'check_in_time')
    list_filter = ('status', 'date') 
    search_fields = ('employee__first_name', 'employee__last_name', 'employee__employee_id')
    ordering = ('-date',)
    date_hierarchy = 'date'

@admin.register(WorkSchedule)
class WorkScheduleAdmin(admin.ModelAdmin):
    list_display = ('start_time', 'end_time')
