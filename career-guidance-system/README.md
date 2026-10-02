# Pathfinder - Career Guidance System

A full-stack app that recommends career roles from a student's skills and interests, identifies skill gaps, creates a learning plan, and tracks progress.

## Stack

- `frontend/`: React and Vite single-page app.
- `backend/`: Node.js and Express API.
- PostgreSQL database accessed with `pg`.

The API creates its tables and seeds career data on its first startup. `DATABASE_URL` must point to a PostgreSQL database.

## Local development

Use Node.js 22 (or newer) and start a PostgreSQL database. Copy `backend/.env.example` to `backend/.env` and set `DATABASE_URL` to your database connection string. The backend loads this file automatically for local development. Vercel reads `DATABASE_URL` from the project's Environment Variables.

```bash
cd backend
npm install
npm start
```

The API runs on `http://localhost:5000`. In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` requests to the local backend.

## Vercel deployment

Import the repository into Vercel and set the project Root Directory to the directory containing this README and `vercel.json` (the repository root). Do not set it to `backend/` or `frontend/`. The root `package.json` provides the build script Vercel expects, and `vercel.json` configures the static frontend build and serverless Express API. Configure `DATABASE_URL` in Vercel's Environment Variables with the connection string for a hosted PostgreSQL database, then deploy.

## API routes

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/students` | Create a student profile |
| GET | `/api/students/:id` | Fetch a profile |
| GET | `/api/careers` | List career roles and required skills |
| GET | `/api/recommend/:studentId` | Ranked career recommendations |
| GET | `/api/skillgap/:studentId/:careerId` | Skill gaps and strengths |
| GET | `/api/learning-plan/:studentId/:careerId` | Learning resources and estimates |
| GET | `/api/progress/:studentId/:careerId` | Progress and overall percentage |
| PATCH | `/api/progress/:id` | Update progress or status |
