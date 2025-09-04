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
    employee_name = serializers.ReadOnlyField(source='employee.first_name')
    class Meta:
        model = Attendance
        fields = '__all__'
