# Listenr Frontend

React + Vite frontend for the Listenr music logging and discovery platform.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env.local` (optional – defaults work with backend proxy)
3. Start the backend (from `../backend`): `uvicorn app.main:app --reload`
4. Run the frontend: `npm run dev`

The app runs at http://localhost:3000. API requests are proxied to the backend at http://127.0.0.1:8000.

**Demo login:** demo@musicboxd.com / demo123 (after running `python scripts/seed.py` in the backend)
