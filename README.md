# LeadFlow: Lead Management CRM

A small CRM to capture leads, track them through a sales pipeline,
search and filter them, and see a live dashboard.

## Features
- Add, edit and delete leads
- Status pipeline (New, Contacted, Qualified, Proposal, Won, Lost);
  every status change is logged automatically
- Search, filters (status, source, date range) and sorting
- Dashboard: KPI cards and charts (leads by status, by source, per week)
- Follow-up reminders: Overdue and Due-today tags, plus a
  "Follow-ups due" quick filter
- Activity timeline and notes for each lead

## Tech stack
- Backend: Python, Django, Django REST Framework, SQLite
- Frontend: React (Vite) with TypeScript, Tailwind CSS, Recharts

## Setup (Windows)
Requires Python 3.11+ and Node.js 22+.

    cd backend
    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py seed_leads
    cd ..\frontend
    npm install

## Run
Double-click `start.bat` (opens the backend and frontend, then the app
at http://localhost:5173), or run the two servers manually:

    cd backend && venv\Scripts\activate && python manage.py runserver
    cd frontend && npm run dev

## API
- `GET/POST /api/leads/`: list (search, filters, ordering) and create
- `GET/PUT/DELETE /api/leads/<id>/`
- `POST /api/leads/<id>/status/`: change status (logged as an activity)
- `GET/POST /api/leads/<id>/activities/`: timeline and notes
- `GET /api/dashboard/`: statistics for the dashboard

## Optional: PostgreSQL
By default the app uses SQLite (no setup needed). To use PostgreSQL:
1. Install PostgreSQL and create a database named `leadflow`.
2. In the backend terminal:

       set USE_POSTGRES=1
       set DB_PASSWORD=your-postgres-password
       python manage.py migrate
       python manage.py seed_leads
       python manage.py runserver

## Built with AI
Built with the help of Google Antigravity (AI coding agent) and Claude
for planning and debugging. 
I have made the changes to the extra features on my own.

Author: Fathima Jebeen