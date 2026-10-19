# LeadFlow: Small CRM for Leads

## Goal
A simple tool to add leads, track them through stages, search them,
and see a dashboard of how sales are going.

## Stack
Backend: Python, Django, Django REST Framework, SQLite database.
Frontend: React (Vite) with TypeScript, Tailwind CSS, Recharts for charts.

## Data
Lead: name, company, email, phone, source, status, deal value,
      notes, follow-up date, created date.
Activity: lead, type (note or status_change), text, date.

## Statuses
New, Contacted, Qualified, Proposal, Won, Lost

## Required features
1. Add, edit and delete leads
2. Change a lead's status (every change is recorded)
3. Search, filter (status, source, date) and sort leads
4. Dashboard: total leads, conversion rate, pipeline value,
   charts by status, source and over time

## Extra features (later, one at a time)
Kanban board, activity timeline, follow-up reminders, dark mode

## Rules for the AI agent
- Do ONE feature at a time and wait for my approval.
- Plan first, then write code.
- Explain what you did in simple words.
- Show loading, empty and error states.
- Do not install extra libraries without telling me why.