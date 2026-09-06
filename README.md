# MediConnect - Doctor Appointment App

A modern doctor appointment booking platform built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Features

- Patient Registration & Login
- Doctor Registration & Management
- Doctor Approval & Availability Management
- Appointment Booking & Scheduling
- In-Person & Video Consultations
- Authentication & Authorization with Clerk
- Patient, Doctor & Admin Dashboards
- Prescription & Medical Record Management
- Notifications
- Responsive User Interface
- Database Management with Prisma

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Next.js API Routes
- Prisma ORM

### Database

- PostgreSQL
- Neon PostgreSQL

### Authentication & Video

- Clerk
- Daily

## Project Structure

```text
app/
components/
hooks/
lib/
prisma/
public/
scripts/
Installation

Clone the repository:

git clone https://github.com/quantum-trace/MediConnect.git
cd MediConnect

Install dependencies:

npm install

Create a .env.local file and add:

DATABASE_URL="your-postgresql-connection-string"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

DAILY_API_KEY="your-daily-api-key"
CRON_SECRET="your-cron-secret"

Generate Prisma Client and setup the database:

npx prisma generate
npx prisma migrate deploy

For a fresh development database:

npx prisma db push

Seed sample data:

npx prisma db seed

Run the development server:

npm run dev

Open:

http://localhost:3000
User Roles
Role	Dashboard
Patient	/dashboard
Doctor	/doctor
Admin	/admin
Prisma Studio

To view the database:

npx prisma studio
Useful Commands
npm run dev
npm run build
npm run start
npm run lint

npx prisma generate
npx prisma migrate deploy
npx prisma db push
npx prisma db seed
npx prisma studio
Future Improvements
Online Payment Integration
AI Health Assistant
Advanced Medical Records
Real-Time Chat
Improved Video Consultation Features

Author
Priya Anand
