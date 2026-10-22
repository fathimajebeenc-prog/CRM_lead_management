from django.contrib import admin
from .models import Lead, Activity


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'company',
        'email',
        'phone',
        'source',
        'status',
        'deal_value',
        'follow_up_date',
        'created_at',
    )
    list_filter = ('status', 'source', 'created_at')
    search_fields = ('name', 'company', 'email', 'phone')


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    list_display = ('lead', 'type', 'created_at')
    list_filter = ('type', 'created_at')
    search_fields = ('lead__name', 'text')
