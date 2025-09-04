from django.db import models
from django_jalali.db import models as jmodels
from django.contrib.auth.models import AbstractUser
import qrcode
from io import BytesIO
from django.core.files import File
from PIL import Image

# مدل کاربر (Employee)
class Employee(models.Model):
    first_name = models.CharField(max_length=100,verbose_name='نام')
    last_name = models.CharField(max_length=100,verbose_name='نام خانوادگی')
    employee_id = models.CharField(max_length=50, unique=True,verbose_name='آی دی کاربر')
    qr_code = models.ImageField(upload_to='qr_codes', blank=True,verbose_name='بارکد اختصاصی')

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    # متد تولید QR Code
    def save(self, *args, **kwargs):

        qr_image = qrcode.make(self.employee_id).convert('RGB')  # تبدیل به RGB
        canvas = Image.new('RGB', qr_image.size, 'white')
    
        canvas.paste(qr_image, (0, 0))
    
        fname = f'qr-{self.employee_id}.png'
        buffer = BytesIO()
        canvas.save(buffer, 'PNG')
        self.qr_code.save(fname, File(buffer), save=False)
        canvas.close()
    
        super().save(*args, **kwargs)


# مدل حضور و غیاب
class Attendance(models.Model):
    objects = jmodels.jManager()
    STATUS_CHOICES = (
        ('present', 'حاضر'),
        ('absent', 'غایب'),
        ('late', 'دیرکرد'),
    )
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='attendances',verbose_name='کاربر')
    date = jmodels.jDateField(auto_now_add=True,verbose_name='تاریخ')
    check_in_time = models.TimeField(blank=True,null=True,verbose_name='ساعت')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='absent',verbose_name='وضعیت')
    late_minutes = models.PositiveIntegerField(default=0,verbose_name='مدت تاخیر(دقیقه)')

    def __str__(self):
        return f"{self.employee} - {self.date.strftime('%d-%m-%Y')} - {self.status}"

#مدل ساعت کاری
class WorkSchedule(models.Model):
    start_time = models.TimeField(default="08:00:00",verbose_name='ساعت شروع')
    end_time = models.TimeField(default="17:00:00",verbose_name='ساعت پایان')