from decimal import Decimal
from django.db import models


class Lead(models.Model):
    class Source(models.TextChoices):
        WEBSITE = 'Website', 'Website'
        REFERRAL = 'Referral', 'Referral'
        LINKEDIN = 'LinkedIn', 'LinkedIn'
        COLD_CALL = 'Cold Call', 'Cold Call'
        EVENT = 'Event', 'Event'
        OTHER = 'Other', 'Other'

    class Status(models.TextChoices):
        NEW = 'New', 'New'
        CONTACTED = 'Contacted', 'Contacted'
        QUALIFIED = 'Qualified', 'Qualified'
        PROPOSAL = 'Proposal', 'Proposal'
        WON = 'Won', 'Won'
        LOST = 'Lost', 'Lost'

    name = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True, default='')
    email = models.EmailField(blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='')
    source = models.CharField(
        max_length=50,
        choices=Source.choices,
        default=Source.WEBSITE,
        blank=True,
    )
    status = models.CharField(
        max_length=50,
        choices=Status.choices,
        default=Status.NEW,
    )
    deal_value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
    )
    notes = models.TextField(blank=True, default='')
    follow_up_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class Activity(models.Model):
    class ActivityType(models.TextChoices):
        NOTE = 'note', 'note'
        STATUS_CHANGE = 'status_change', 'status_change'

    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        related_name='activities',
    )
    type = models.CharField(
        max_length=20,
        choices=ActivityType.choices,
        default=ActivityType.NOTE,
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'activities'

    def __str__(self):
        return f"{self.lead.name} - {self.type} ({self.created_at})"
