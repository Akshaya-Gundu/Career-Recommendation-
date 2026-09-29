# Pathfinder — AI-Powered Career Recommendation & Skill-Gap Analysis System

A full-stack app that takes a student's skills, interests, education and projects, recommends
matching career roles using a weighted content-based scoring algorithm, analyzes the skill gap
against a chosen role, generates a personalized learning plan, and tracks progress.

## Architecture

```
STUDENT → Profile Form → [Node/Express API] → Recommendation Engine → Ranked Careers
                                                      │
                                     Select Target Career
                                                      │
                                            Skill Gap Analysis
                                                      │
                                     Personalized Learning Plan
                                                      │
                                          Progress Tracking (SQLite)
```

- **frontend/** — React (Vite) single-page app. Pages: Profile, Recommendations, Skill Gap,
  Learning Plan, Progress. Talks to the API at `http://localhost:5000/api`.
- **backend/** — Node/Express REST API. Uses `better-sqlite3` for a local, file-based SQLite
  database (`backend/career.db`, created automatically on first run and seeded with 6 career
  profiles: Software Developer, Data Analyst, Web Developer, ML Engineer, UI/UX Designer,
  DevOps Engineer).

### How the "AI" recommendation works

This is a **weighted content-based recommender** (a standard lightweight ML/IR technique — no
external model or API key needed, so it runs fully offline):

1. Each career has required skills with an importance weight (1–3) and a set of interest tags.
2. For a student, `skillScore` = (sum of weight × min(proficiency,5) for skills they have) ÷
   (max possible weighted score), and `interestScore` = overlap of student/career interest tags.
3. `finalScore = 0.7 × skillScore + 0.3 × interestScore`, shown as a match percentage.

Swap `backend/routes/recommend.js` for a call to a hosted ML model or the Anthropic API later
without touching the rest of the app — the route's output shape is all the frontend depends on.

### Skill-gap severity

For each required skill the student doesn't fully have: `score = weight × (5 - proficiency)`.
`score ≥ 9` → **High**, `≥ 4` → **Medium**, else **Low**. This drives learning-plan ordering and
time estimates (High = 4 weeks, Medium = 2 weeks, Low = 1 week, per skill).

## Setup

Requires Node.js 22 LTS for the backend (`better-sqlite3` is a native module). Node 24 may not
have a prebuilt binary available, and compiling it on Windows requires Visual Studio Build Tools
with the **Desktop development with C++** workload.

### 1. Backend

```bash
cd backend
npm install
npm start
```
Runs on `http://localhost:5000`. The SQLite DB is created and seeded automatically on first run.

### 2. Frontend

In a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173`. Open that URL in your browser.

## API reference

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/students` | Create a student profile (skills, interests, projects) |
| GET | `/api/students/:id` | Fetch a profile |
| GET | `/api/careers` | List all career roles with required skills |
| GET | `/api/recommend/:studentId` | Ranked career matches for a student |
| GET | `/api/skillgap/:studentId/:careerId` | Missing/weak skills with severity |
| GET | `/api/learning-plan/:studentId/:careerId` | Resources + time estimate per gap skill |
| GET | `/api/progress/:studentId/:careerId` | Progress per tracked skill + overall % |
| PATCH | `/api/progress/:id` | Update `progressPercent` or `status` for one skill |

## Extending this project

- Add more careers/skills by editing `backend/data/careers.js` (re-seeds only on an empty DB —
  delete `backend/career.db` to reseed from scratch).
- Add more learning resources per skill in `backend/data/resources.js`.
- Swap the scoring function in `recommend.js` for a trained classifier if you want a "real" ML
  model for a research/thesis angle — the DB schema already stores everything needed as features
  (skills, proficiency, interests).
- Add authentication if this needs to support multiple real users instead of a single
  browser-local `studentId`.
