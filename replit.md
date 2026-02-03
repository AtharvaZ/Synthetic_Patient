# MediTutor AI - Frontend

## Overview

MediTutor AI is a medical education platform that helps medical students practice clinical diagnosis through interactive case simulations. This is the frontend branch with React + Express.

## Local Setup

```bash
# 1. Clone and install
git clone <repo-url>
cd meditutor
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your DATABASE_URL

# 3. Push database schema
npm run db:push

# 4. Run development server
npm run dev
```

The app will be available at `http://localhost:5000`

## Project Structure

```
├── frontend/
│   ├── client/          # React frontend (Vite)
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── hooks/
│   │   │   └── lib/
│   │   └── index.html
│   ├── server/          # Express backend
│   │   ├── index.ts
│   │   ├── routes.ts
│   │   └── storage.ts
│   ├── shared/          # Shared types/schema
│   │   ├── schema.ts
│   │   └── routes.ts
│   └── script/          # Build scripts
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── drizzle.config.ts
└── .env.example
```

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui (Radix UI)
- **Animations**: Framer Motion

### Backend
- **Framework**: Express.js 5.x with TypeScript
- **ORM**: Drizzle ORM
- **Database**: PostgreSQL
- **Validation**: Zod

## NPM Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run check` - TypeScript check
- `npm run db:push` - Push schema to database

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NODE_ENV` | `development` or `production` |
| `PORT` | Server port (default: 5000) |

## Path Aliases

- `@/` → `frontend/client/src/`
- `@shared/` → `frontend/shared/`
