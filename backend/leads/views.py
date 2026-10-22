from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Lead, Activity
from .serializers import LeadSerializer, ActivitySerializer


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'source']
    search_fields = ['name', 'company', 'email', 'phone', 'notes']
    ordering_fields = ['created_at', 'updated_at', 'deal_value', 'name', 'follow_up_date']
    ordering = ['-created_at']


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['lead', 'type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']
