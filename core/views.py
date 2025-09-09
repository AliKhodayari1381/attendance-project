from rest_framework import viewsets
from .models import Employee, Attendance,WorkSchedule
from .serializers import EmployeeSerializer, AttendanceSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated,AllowAny
from rest_framework.response import Response
from datetime import datetime
import jdatetime
from .models import Employee, Attendance

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer


@api_view(['POST'])
@permission_classes([AllowAny])
def check_in(request):
    """
    ثبت حضور با QR Code (employee_id)
    """
    employee_id = request.data.get('employee_id')
    try:
        employee = Employee.objects.get(employee_id=employee_id)
    except Employee.DoesNotExist:
        return Response({"خطا": "کاربر یافت نشد"}, status=404)

    # بررسی اگر حضور امروز ثبت شده
    today = datetime.today().date()
    if Attendance.objects.filter(employee=employee, date=today).exists():
        return Response({"پیغام": "این کاربر قبلا ثبت کرده است"}, status=400)

    now = datetime.now()
    schedule = WorkSchedule.objects.first()
    work_start = schedule.start_time

    status=Attendance.Status.PRESENT.label
    late_minutes = 0

    if now.time() > work_start:
        status=Attendance.Status.LATE.label

        diff = datetime.combine(today, now.time()) - datetime.combine(today, work_start)
        late_minutes = diff.seconds // 60

    attendance = Attendance.objects.create(
        employee = employee , 
        date= today,
        check_in_time = now.time(),
        status = status,
        late_minutes = late_minutes

    )
    jalali_date = attendance.date.strftime("%Y-%m-%d")
    return Response({
        "پیغام": "با موفقیت ثبت شد",
        "کارمند": employee.first_name +' '+employee.last_name,
        "تاریخ": jalali_date,
        "زمان": attendance.check_in_time.strftime("%H:%M"),
        "وضعیت": attendance.status,
        "مدت زمان تاخیر": f"{attendance.late_minutes} دقیقه"

    })
    