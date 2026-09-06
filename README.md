# MediConnect - Doctor Appointment App

A modern doctor appointment booking platform built with Next.js, TypeScript, Prisma, PostgreSQL, and Clerk.

## Features

- Patient Registration & Login
- Doctor Registration & Management
- Doctor Approval & Availability Management
- Appointment Booking & Scheduling
- In-Person & Video Consultations
- Authentication & Authorization
- Patient, Doctor & Admin Dashboards
- Prescription & Medical Record Management
- Notifications
- Responsive User Interface

## Tech Stack

**Frontend**
- Next.js
- React
- TypeScript
- Tailwind CSS

**Backend**
- Next.js API Routes
- Prisma ORM

**Database**

- PostgreSQL
- Neon PostgreSQL

**Authentication & Video**

- Clerk
- Daily

## Project Structure
app/
components/
hooks/
lib/
prisma/
public/
scripts/
Installation

## Clone the repository:
```bash
git clone https://github.com/quantum-trace/MediConnect.git
cd MediConnect
```
## Install dependencies:
```bash
npm install
```
## Create a .env.local file:
```bash
DATABASE_URL="your-postgresql-connection-string"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your-clerk-publishable-key"
CLERK_SECRET_KEY="your-clerk-secret-key"

NEXT_PUBLIC_APP_URL="http://localhost:3000"

DAILY_API_KEY="your-daily-api-key"
```
## Setup the database:
```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```
## For a fresh development database:
```bash
npx prisma db push
```
## Run the development server:
```bash
npm run dev
```
## Open:
```bash
http://localhost:3000
```
## Deployment
The application is deployed using Vercel.
Production environment variables must be configured in the Vercel project settings.

## User Roles
| Role | Dashboard |
|------|-----------|
| Patient | `/dashboard` |
| Doctor | `/doctor` |
| Admin | `/admin` |

## To view the database locally:
```bash
npx prisma studio
```
## Useful Commands
```bash
npm run dev
npm run build
npm run start
npm run lint

npx prisma generate
npx prisma migrate deploy
npx prisma db push
npx prisma db seed
npx prisma studio
```
## Future Improvements
Online Payment Integration
AI Health Assistant
Real-Time Chat
Advanced Medical Records
Improved Video Consultation Features

## Author
Priya Anand
