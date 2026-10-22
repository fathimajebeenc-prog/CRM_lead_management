from rest_framework import serializers
from .models import Lead, Activity


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = [
            'id',
            'lead',
            'type',
            'text',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']


class LeadSerializer(serializers.ModelSerializer):
    activities = ActivitySerializer(many=True, read_only=True)

    class Meta:
        model = Lead
        fields = [
            'id',
            'name',
            'company',
            'email',
            'phone',
            'source',
            'status',
            'deal_value',
            'notes',
            'follow_up_date',
            'created_at',
            'updated_at',
            'activities',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'activities']
