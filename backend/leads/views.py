from datetime import timedelta
from decimal import Decimal
import django_filters
from django.db import models
from django.db.models import Count, Sum
from django.db.models.functions import TruncWeek
from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from .models import Lead, Activity
from .serializers import LeadSerializer, ActivitySerializer


class LeadFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Lead.Status.choices)
    source = django_filters.ChoiceFilter(choices=Lead.Source.choices)
    created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='date__gte')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='date__lte')

    class Meta:
        model = Lead
        fields = ['status', 'source', 'created_after', 'created_before']


class LeadViewSet(viewsets.ModelViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer
    pagination_class = None
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = LeadFilter
    search_fields = ['name', 'company', 'email']
    ordering_fields = ['created_at', 'name', 'deal_value', 'follow_up_date']
    ordering = ['-created_at']

    @action(detail=True, methods=['post'], url_path='status')
    def update_status(self, request, pk=None):
        lead = self.get_object()
        status_input = request.data.get('status')
        if not status_input:
            return Response(
                {'error': 'Status is required.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        matched_status = None
        for choice_val in Lead.Status.values:
            if status_input == choice_val or str(status_input).strip().lower() == choice_val.lower():
                matched_status = choice_val
                break

        if not matched_status:
            return Response(
                {'error': f"Invalid status. Must be one of: {list(Lead.Status.values)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        old_status = lead.status
        new_status = matched_status
        lead.status = new_status
        lead.save()

        Activity.objects.create(
            lead=lead,
            type=Activity.ActivityType.STATUS_CHANGE,
            text=f"Status changed from {old_status} to {new_status}",
        )

        serializer = self.get_serializer(lead)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post'], url_path='activities')
    def activities(self, request, pk=None):
        lead = self.get_object()
        if request.method == 'GET':
            activities_qs = lead.activities.all().order_by('-created_at')
            serializer = ActivitySerializer(activities_qs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        text = request.data.get('text')
        if not text or not str(text).strip():
            return Response(
                {'text': ['This field is required.']},
                status=status.HTTP_400_BAD_REQUEST,
            )

        activity = Activity.objects.create(
            lead=lead,
            type=Activity.ActivityType.NOTE,
            text=str(text).strip(),
        )
        serializer = ActivitySerializer(activity)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ActivityViewSet(viewsets.ModelViewSet):
    queryset = Activity.objects.all()
    serializer_class = ActivitySerializer
    pagination_class = None
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['lead', 'type']
    ordering_fields = ['created_at']
    ordering = ['-created_at']


class DashboardView(APIView):
    def get(self, request):
        today = timezone.localdate()

        agg = Lead.objects.aggregate(
            total_leads=Count('id'),
            won_leads=Count('id', filter=models.Q(status=Lead.Status.WON)),
            pipeline_value=Sum(
                'deal_value',
                filter=~models.Q(status__in=[Lead.Status.WON, Lead.Status.LOST]),
            ),
            won_value=Sum(
                'deal_value',
                filter=models.Q(status=Lead.Status.WON),
            ),
            overdue_followups=Count(
                'id',
                filter=(
                    ~models.Q(status__in=[Lead.Status.WON, Lead.Status.LOST])
                    & models.Q(follow_up_date__lt=today)
                ),
            ),
        )

        total_leads = agg['total_leads'] or 0
        won_leads = agg['won_leads'] or 0
        pipeline_value = float(agg['pipeline_value'] or 0)
        won_value = float(agg['won_value'] or 0)
        overdue_followups = agg['overdue_followups'] or 0

        conversion_rate = round((won_leads / total_leads) * 100, 2) if total_leads > 0 else 0

        # by_status: ALL statuses even if 0
        status_counts = dict(
            Lead.objects.values('status')
            .annotate(count=Count('id'))
            .values_list('status', 'count')
        )
        by_status = [
            {'status': s, 'count': status_counts.get(s, 0)}
            for s in Lead.Status.values
        ]

        # by_source
        source_counts = dict(
            Lead.objects.values('source')
            .annotate(count=Count('id'))
            .values_list('source', 'count')
        )
        by_source = [
            {'source': s, 'count': source_counts.get(s, 0)}
            for s in Lead.Source.values
        ]

        # per_week: last 8 weeks (week start: Monday)
        current_week_start = today - timedelta(days=today.weekday())
        eight_weeks_ago = current_week_start - timedelta(weeks=7)

        weekly_qs = (
            Lead.objects.filter(created_at__date__gte=eight_weeks_ago)
            .annotate(week=TruncWeek('created_at'))
            .values('week')
            .annotate(count=Count('id'))
        )
        weekly_map = {}
        for item in weekly_qs:
            w = item['week']
            if w:
                w_date = w.date() if hasattr(w, 'date') else w
                weekly_map[w_date.strftime('%Y-%m-%d')] = item['count']

        per_week = [
            {
                'week': (current_week_start - timedelta(weeks=i)).strftime('%Y-%m-%d'),
                'count': weekly_map.get(
                    (current_week_start - timedelta(weeks=i)).strftime('%Y-%m-%d'), 0
                ),
            }
            for i in reversed(range(8))
        ]

        data = {
            'total_leads': total_leads,
            'won_leads': won_leads,
            'conversion_rate': conversion_rate,
            'pipeline_value': pipeline_value,
            'won_value': won_value,
            'overdue_followups': overdue_followups,
            'by_status': by_status,
            'by_source': by_source,
            'per_week': per_week,
        }
        return Response(data)
