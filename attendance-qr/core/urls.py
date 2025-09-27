from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmployeeViewSet, AttendanceViewSet,WorkScheduleViewSet
from .views import check_in

router = DefaultRouter()
router.register(r'employees', EmployeeViewSet)
router.register(r'attendance', AttendanceViewSet)
router.register(r'works-chedule',WorkScheduleViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('check-in/', check_in, name='check_in'),
]
