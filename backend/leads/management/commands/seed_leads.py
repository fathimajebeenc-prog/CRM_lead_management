from datetime import timedelta
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from leads.models import Lead, Activity


class Command(BaseCommand):
    help = 'Clears existing leads and seeds 30 realistic sample leads with activities'

    def handle(self, *args, **options):
        # 1. Clear existing leads (Activity cascades on lead delete)
        self.stdout.write('Clearing existing leads and activities...')
        Lead.objects.all().delete()
        Activity.objects.all().delete()

        today = timezone.localdate()
        now = timezone.now()

        # 30 realistic sample leads
        sample_leads_data = [
            # Week 8 ago (~50-55 days ago)
            {
                'name': 'Sarah Jenkins',
                'company': 'Apex Logistics',
                'email': 'sarah.j@apexlogistics.com',
                'phone': '+1 (555) 234-5678',
                'source': Lead.Source.WEBSITE,
                'status': Lead.Status.WON,
                'deal_value': Decimal('35000.00'),
                'notes': 'Enterprise fleet management contract signed.',
                'days_ago': 53,
                'follow_up_offset': None,
            },
            {
                'name': 'David Miller',
                'company': 'BlueWave Digital',
                'email': 'david@bluewave.io',
                'phone': '+1 (555) 345-6789',
                'source': Lead.Source.LINKEDIN,
                'status': Lead.Status.LOST,
                'deal_value': Decimal('12000.00'),
                'notes': 'Opted for internal solution due to budget cut.',
                'days_ago': 51,
                'follow_up_offset': None,
            },
            {
                'name': 'Elena Rostova',
                'company': 'CloudSphere Inc',
                'email': 'elena@cloudsphere.net',
                'phone': '+1 (555) 456-7890',
                'source': Lead.Source.REFERRAL,
                'status': Lead.Status.WON,
                'deal_value': Decimal('48000.00'),
                'notes': 'Referred by CTO of Apex. Multi-year agreement.',
                'days_ago': 49,
                'follow_up_offset': None,
            },
            # Week 7 ago (~43-48 days ago)
            {
                'name': 'Marcus Vance',
                'company': 'Vance & Sterling Legal',
                'email': 'mvance@vancelegal.com',
                'phone': '+1 (555) 567-8901',
                'source': Lead.Source.COLD_CALL,
                'status': Lead.Status.QUALIFIED,
                'deal_value': Decimal('18500.00'),
                'notes': 'Needs document automation pipeline.',
                'days_ago': 46,
                'follow_up_offset': -12,  # Overdue
            },
            {
                'name': 'Priya Patel',
                'company': 'Nexus Health Systems',
                'email': 'p.patel@nexushealth.org',
                'phone': '+1 (555) 678-9012',
                'source': Lead.Source.EVENT,
                'status': Lead.Status.PROPOSAL,
                'deal_value': Decimal('62000.00'),
                'notes': 'HIPAA compliance audit review in progress.',
                'days_ago': 44,
                'follow_up_offset': -8,  # Overdue
            },
            {
                'name': 'Carlos Mendez',
                'company': 'Solaria Energy',
                'email': 'carlos@solariaenergy.com',
                'phone': '+1 (555) 789-0123',
                'source': Lead.Source.WEBSITE,
                'status': Lead.Status.LOST,
                'deal_value': Decimal('8500.00'),
                'notes': 'Delayed project to next fiscal year.',
                'days_ago': 43,
                'follow_up_offset': None,
            },
            {
                'name': 'Hanna Lindqvist',
                'company': 'Nordic Retail Group',
                'email': 'hanna.l@nordicretail.se',
                'phone': '+46 8 123 4567',
                'source': Lead.Source.LINKEDIN,
                'status': Lead.Status.WON,
                'deal_value': Decimal('55000.00'),
                'notes': 'Expansion across 12 store locations.',
                'days_ago': 42,
                'follow_up_offset': None,
            },
            # Week 6 ago (~36-41 days ago)
            {
                'name': 'Brian O\'Connor',
                'company': 'FastTrack Logistics',
                'email': 'brian@fasttracklog.com',
                'phone': '+1 (555) 890-1234',
                'source': Lead.Source.OTHER,
                'status': Lead.Status.CONTACTED,
                'deal_value': Decimal('14000.00'),
                'notes': 'Reached out after reading industry whitepaper.',
                'days_ago': 39,
                'follow_up_offset': -15,  # Overdue
            },
            {
                'name': 'Amina Diallo',
                'company': 'Sahel FinTech',
                'email': 'adiallo@sahelfintech.com',
                'phone': '+1 (555) 901-2345',
                'source': Lead.Source.EVENT,
                'status': Lead.Status.PROPOSAL,
                'deal_value': Decimal('75000.00'),
                'notes': 'Proposal submitted for mobile payment orchestration.',
                'days_ago': 37,
                'follow_up_offset': 3,  # Future follow-up
            },
            {
                'name': 'Liam Gallagher',
                'company': 'Bravado Media',
                'email': 'liam@bravadomedia.co.uk',
                'phone': '+44 20 7946 0912',
                'source': Lead.Source.WEBSITE,
                'status': Lead.Status.NEW,
                'deal_value': Decimal('5000.00'),
                'notes': 'Inbound inquiry from contact form.',
                'days_ago': 36,
                'follow_up_offset': None,
            },
            # Week 5 ago (~29-34 days ago)
            {
                'name': 'Rachel Green',
                'company': 'Central Perk Roasters',
                'email': 'rachel@centralperk.com',
                'phone': '+1 (555) 012-3456',
                'source': Lead.Source.REFERRAL,
                'status': Lead.Status.QUALIFIED,
                'deal_value': Decimal('9500.00'),
                'notes': 'Evaluating POS integration.',
                'days_ago': 33,
                'follow_up_offset': -5,  # Overdue
            },
            {
                'name': 'Takashi Sato',
                'company': 'Kyoto Robotics Corp',
                'email': 'sato@kyotorobotics.jp',
                'phone': '+81 3 5555 0143',
                'source': Lead.Source.LINKEDIN,
                'status': Lead.Status.WON,
                'deal_value': Decimal('92000.00'),
                'notes': 'Closed annual enterprise license with APAC team.',
                'days_ago': 31,
                'follow_up_offset': None,
            },
            {
                'name': 'Zoe Washington',
                'company': 'Elevate HR Solutions',
                'email': 'zoe@elevatehr.com',
                'phone': '+1 (555) 123-9876',
                'source': Lead.Source.COLD_CALL,
                'status': Lead.Status.CONTACTED,
                'deal_value': Decimal('16000.00'),
                'notes': 'Left voicemail; followed up with email deck.',
                'days_ago': 30,
                'follow_up_offset': -6,  # Overdue
            },
            # Week 4 ago (~22-27 days ago)
            {
                'name': 'Kevin Zhao',
                'company': 'Matrix Analytics',
                'email': 'kevin@matrixanalytics.io',
                'phone': '+1 (555) 234-8765',
                'source': Lead.Source.WEBSITE,
                'status': Lead.Status.PROPOSAL,
                'deal_value': Decimal('38000.00'),
                'notes': 'Custom dashboard implementation quote delivered.',
                'days_ago': 26,
                'follow_up_offset': 4,  # Future follow-up
            },
            {
                'name': 'Ingrid Bergman',
                'company': 'Scandi Design Studio',
                'email': 'ingrid@scandidesign.se',
                'phone': '+46 8 234 5678',
                'source': Lead.Source.OTHER,
                'status': Lead.Status.LOST,
                'deal_value': Decimal('6000.00'),
                'notes': 'Selected a lightweight freemium tool.',
                'days_ago': 24,
                'follow_up_offset': None,
            },
            {
                'name': 'Lucas Silva',
                'company': 'Terra Verde Agro',
                'email': 'lucas@terraverde.com.br',
                'phone': '+55 11 98765-4321',
                'source': Lead.Source.EVENT,
                'status': Lead.Status.QUALIFIED,
                'deal_value': Decimal('27000.00'),
                'notes': 'Met at AgriTech Global Expo.',
                'days_ago': 23,
                'follow_up_offset': -3,  # Overdue
            },
            {
                'name': 'Chloe Dupont',
                'company': 'Lumiere Biotech',
                'email': 'cdupont@lumierebio.fr',
                'phone': '+33 1 42 68 55 00',
                'source': Lead.Source.LINKEDIN,
                'status': Lead.Status.CONTACTED,
                'deal_value': Decimal('42000.00'),
                'notes': 'Expressed interest in lab workflow module.',
                'days_ago': 22,
                'follow_up_offset': 5,  # Future follow-up
            },
            # Week 3 ago (~15-20 days ago)
            {
                'name': 'Omar Al-Mansoor',
                'company': 'Gulf Oasis Real Estate',
                'email': 'omar@gulfoasis.ae',
                'phone': '+971 4 321 0987',
                'source': Lead.Source.REFERRAL,
                'status': Lead.Status.WON,
                'deal_value': Decimal('68000.00'),
                'notes': 'Enterprise CRM deployment for 50 agents.',
                'days_ago': 19,
                'follow_up_offset': None,
            },
            {
                'name': 'Maya Lin',
                'company': 'Aura Smart Home',
                'email': 'maya.lin@aurasmart.com',
                'phone': '+1 (555) 345-7890',
                'source': Lead.Source.WEBSITE,
                'status': Lead.Status.NEW,
                'deal_value': Decimal('15000.00'),
                'notes': 'Signed up for live product demo.',
                'days_ago': 17,
                'follow_up_offset': None,
            },
            {
                'name': 'Stefan Mueller',
                'company': 'Bavaria Precision Parts',
                'email': 's.mueller@bavariaprecision.de',
                'phone': '+49 89 12345678',
                'source': Lead.Source.COLD_CALL,
                'status': Lead.Status.PROPOSAL,
                'deal_value': Decimal('31000.00'),
                'notes': 'Sent formal RFP responses to procurement.',
                'days_ago': 16,
                'follow_up_offset': -2,  # Overdue
            },
            # Week 2 ago (~8-13 days ago)
            {
                'name': 'Fatima Zahra',
                'company': 'Atlas Shipping Co',
                'email': 'fzahra@atlasshipping.ma',
                'phone': '+212 522 123456',
                'source': Lead.Source.EVENT,
                'status': Lead.Status.QUALIFIED,
                'deal_value': Decimal('24000.00'),
                'notes': 'Needs freight tracking dashboard.',
                'days_ago': 12,
                'follow_up_offset': 2,  # Future follow-up
            },
            {
                'name': 'Nathan Drake',
                'company': 'Uncharted Adventures',
                'email': 'nathan@unchartedadventures.com',
                'phone': '+1 (555) 456-0192',
                'source': Lead.Source.LINKEDIN,
                'status': Lead.Status.CONTACTED,
                'deal_value': Decimal('7800.00'),
                'notes': 'Exploratory conversation regarding tour booking.',
                'days_ago': 11,
                'follow_up_offset': -4,  # Overdue
            },
            {
                'name': 'Jessica Alba',
                'company': 'Honest Goods Co',
                'email': 'jalba@honestgoods.org',
                'phone': '+1 (555) 567-1234',
                'source': Lead.Source.WEBSITE,
                'status': Lead.Status.QUALIFIED,
                'deal_value': Decimal('21000.00'),
                'notes': 'Supply chain audit completed.',
                'days_ago': 9,
                'follow_up_offset': 6,  # Future follow-up
            },
            {
                'name': 'Alexander Wright',
                'company': 'Sterling Security Group',
                'email': 'awright@sterlingsec.co.uk',
                'phone': '+44 20 7123 4567',
                'source': Lead.Source.REFERRAL,
                'status': Lead.Status.NEW,
                'deal_value': Decimal('19000.00'),
                'notes': 'Inbound referral from existing client.',
                'days_ago': 8,
                'follow_up_offset': None,
            },
            # Current / Last week (~0-6 days ago)
            {
                'name': 'Emily Watson',
                'company': 'Pioneer EdTech',
                'email': 'emily@pioneered.org',
                'phone': '+1 (555) 678-2345',
                'source': Lead.Source.WEBSITE,
                'status': Lead.Status.PROPOSAL,
                'deal_value': Decimal('29000.00'),
                'notes': 'Discount tier requested for academic year.',
                'days_ago': 5,
                'follow_up_offset': 1,  # Future follow-up
            },
            {
                'name': 'Tariq Hassan',
                'company': 'Crescent Logistics',
                'email': 'tariq@crescentlog.com',
                'phone': '+966 11 234 5678',
                'source': Lead.Source.COLD_CALL,
                'status': Lead.Status.CONTACTED,
                'deal_value': Decimal('13500.00'),
                'notes': 'Agreed to introductory video call.',
                'days_ago': 4,
                'follow_up_offset': -1,  # Overdue
            },
            {
                'name': 'Grace Hopper',
                'company': 'Compiler Tech Labs',
                'email': 'grace@compilertech.io',
                'phone': '+1 (555) 789-3456',
                'source': Lead.Source.LINKEDIN,
                'status': Lead.Status.QUALIFIED,
                'deal_value': Decimal('54000.00'),
                'notes': 'Technical evaluation underway.',
                'days_ago': 3,
                'follow_up_offset': 7,  # Future follow-up
            },
            {
                'name': 'Noah Robinson',
                'company': 'Summit Peak Capital',
                'email': 'noah@summitpeakcap.com',
                'phone': '+1 (555) 890-4567',
                'source': Lead.Source.OTHER,
                'status': Lead.Status.NEW,
                'deal_value': Decimal('0.00'),
                'notes': 'General query regarding enterprise tier pricing.',
                'days_ago': 2,
                'follow_up_offset': None,
            },
            {
                'name': 'Sergei Volkov',
                'company': 'Titan Heavy Industries',
                'email': 'svolkov@titanheavy.com',
                'phone': '+1 (555) 901-5678',
                'source': Lead.Source.EVENT,
                'status': Lead.Status.NEW,
                'deal_value': Decimal('45000.00'),
                'notes': 'Met at manufacturing trade summit yesterday.',
                'days_ago': 1,
                'follow_up_offset': 3,  # Future follow-up
            },
            {
                'name': 'Hannah Abbott',
                'company': 'Botanical Organics',
                'email': 'hannah@botanicalorganics.co.uk',
                'phone': '+44 20 8901 2345',
                'source': Lead.Source.WEBSITE,
                'status': Lead.Status.NEW,
                'deal_value': Decimal('7500.00'),
                'notes': 'Trial requested via website signup form.',
                'days_ago': 0,
                'follow_up_offset': None,
            },
        ]

        created_leads = []
        for data in sample_leads_data:
            follow_up = None
            if data['follow_up_offset'] is not None:
                follow_up = today + timedelta(days=data['follow_up_offset'])

            lead = Lead.objects.create(
                name=data['name'],
                company=data['company'],
                email=data['email'],
                phone=data['phone'],
                source=data['source'],
                status=data['status'],
                deal_value=data['deal_value'],
                notes=data['notes'],
                follow_up_date=follow_up,
            )

            # Override created_at to simulate dates over the last 8 weeks
            created_dt = now - timedelta(days=data['days_ago'], hours=2)
            Lead.objects.filter(id=lead.id).update(created_at=created_dt)
            created_leads.append(lead)

        # 2. Add realistic sample activities across several leads
        activities_data = [
            (
                created_leads[0],  # Sarah Jenkins (Won)
                Activity.ActivityType.STATUS_CHANGE,
                'Status changed from New to Contacted',
                52,
            ),
            (
                created_leads[0],
                Activity.ActivityType.STATUS_CHANGE,
                'Status changed from Contacted to Qualified',
                51,
            ),
            (
                created_leads[0],
                Activity.ActivityType.STATUS_CHANGE,
                'Status changed from Qualified to Proposal',
                50,
            ),
            (
                created_leads[0],
                Activity.ActivityType.STATUS_CHANGE,
                'Status changed from Proposal to Won',
                49,
            ),
            (
                created_leads[0],
                Activity.ActivityType.NOTE,
                'Contract finalized and payment received via wire transfer.',
                49,
            ),
            (
                created_leads[1],  # David Miller (Lost)
                Activity.ActivityType.NOTE,
                'David mentioned leadership decided to freeze vendor onboarding.',
                50,
            ),
            (
                created_leads[1],
                Activity.ActivityType.STATUS_CHANGE,
                'Status changed from Proposal to Lost',
                49,
            ),
            (
                created_leads[3],  # Marcus Vance (Qualified, overdue)
                Activity.ActivityType.NOTE,
                'Completed introductory demonstration for senior partners.',
                45,
            ),
            (
                created_leads[4],  # Priya Patel (Proposal, overdue)
                Activity.ActivityType.STATUS_CHANGE,
                'Status changed from Qualified to Proposal',
                40,
            ),
            (
                created_leads[4],
                Activity.ActivityType.NOTE,
                'Sent updated HIPAA addendum per legal team request.',
                38,
            ),
            (
                created_leads[8],  # Amina Diallo (Proposal)
                Activity.ActivityType.NOTE,
                'Scheduled proposal defense call with procurement committee.',
                35,
            ),
            (
                created_leads[10],  # Rachel Green (Qualified, overdue)
                Activity.ActivityType.STATUS_CHANGE,
                'Status changed from Contacted to Qualified',
                31,
            ),
            (
                created_leads[24],  # Emily Watson (Proposal)
                Activity.ActivityType.STATUS_CHANGE,
                'Status changed from Contacted to Proposal',
                4,
            ),
            (
                created_leads[24],
                Activity.ActivityType.NOTE,
                'Sent quote for 250 student workstation licenses.',
                3,
            ),
        ]

        for lead, act_type, text, days_ago in activities_data:
            act = Activity.objects.create(
                lead=lead,
                type=act_type,
                text=text,
            )
            act_dt = now - timedelta(days=days_ago, hours=1)
            Activity.objects.filter(id=act.id).update(created_at=act_dt)

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully seeded {len(created_leads)} leads and {len(activities_data)} activities.'
            )
        )
