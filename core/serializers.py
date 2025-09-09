from rest_framework import serializers
from .models import Employee, Attendance

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id','first_name', 'last_name', 'employee_id']
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['نام'] = rep.pop('first_name')
        rep['نام خانوادگی'] = rep.pop('last_name')
        rep['کد کارمندی'] = rep.pop('employee_id')
        return rep

        

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee', read_only=True)
    class Meta:
        model = Attendance
        fields = ['date' ,'check_in_time', 'status' ,'late_minutes','employee_name']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['کاربر'] = data.pop('employee_name')
        data['تاریخ'] = data.pop('date')
        data['ثبت شده در'] = data.pop('check_in_time')
        data['status'] = instance.get_status_display()
        data['وضعیت'] = data.pop('status')
        data['دیر کرد'] = data.pop('late_minutes')

        return data