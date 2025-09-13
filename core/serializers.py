from rest_framework import serializers
from .models import Employee, Attendance,WorkSchedule

class EmployeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Employee
        fields = ['id','first_name', 'last_name', 'employee_id','qr_code']
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        rep['نام'] = rep.pop('first_name')
        rep['نام خانوادگی'] = rep.pop('last_name')
        rep['کد کارمندی'] = rep.pop('employee_id')
        rep['QR-code'] = rep.pop('qr_code')
        return rep
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.method != 'GET':
            
            self.fields.pop('qr_code', None)
        

class AttendanceSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee', read_only=True)
    late_minutes_display = serializers.SerializerMethodField()
    class Meta:
        model = Attendance
        fields = ['id','date' ,'check_in_time', 'status' ,'late_minutes_display','employee_name']

        
    def get_late_minutes_display(self, obj):
        return f" {obj.late_minutes} دقیقه"
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['کاربر'] = data.pop('employee_name')
        data['تاریخ'] = data.pop('date')

        if instance.check_in_time:
            data['ثبت شده در'] = str(instance.check_in_time.replace(microsecond=0))
        else:
            data['ثبت شده در'] = None  
        
        data.pop('check_in_time', None)
        data['status'] = instance.get_status_display()
        data['وضعیت'] = data.pop('status')
        data['دیر کرد'] = data.pop('late_minutes_display')

        return data
    

class WorkScheduleSerializers(serializers.ModelSerializer):
    class Meta:
        model = WorkSchedule
        fields  =['start_time','end_time']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['ساعت شروع'] = data.pop('start_time')
        data['ساعت پایان'] = data.pop('end_time')

        return data