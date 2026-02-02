# MediTutor AI

## Overview

MediTutor AI is a medical education platform that helps medical students practice clinical diagnosis through interactive case simulations and quizzes. The application presents medical cases across different specialties (Cardiology, Neurology, Pediatrics) with varying difficulty levels, allowing students to develop their diagnostic reasoning skills through AI-guided conversations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state management and caching
- **Styling**: Tailwind CSS with a dark theme medical-focused design using CSS custom properties for theming
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Animations**: Framer Motion for page transitions and interactive elements

The frontend follows a pages-based structure with reusable components. Custom hooks in `/client/src/hooks/` abstract API interactions for cases and chats.

### Backend Architecture
- **Framework**: Express.js 5.x running on Node.js with TypeScript
- **API Design**: RESTful API with typed route definitions in `/shared/routes.ts` using Zod for validation
- **Build System**: Custom build script using esbuild for server bundling and Vite for client bundling

### Data Storage
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `/shared/schema.ts` with tables for users, cases, chats, and messages
- **Current Implementation**: In-memory storage (`MemStorage` class) for development, with database schema ready for PostgreSQL migration
- **Session Storage**: Connect-pg-simple available for session management

### Key Design Patterns
- **Shared Types**: The `/shared/` directory contains schema definitions and route contracts used by both frontend and backend, ensuring type safety across the stack
- **API Abstraction**: Route definitions include method, path, input validation, and response schemas, enabling type-safe API consumption
- **Path Aliases**: TypeScript path aliases (`@/` for client, `@shared/` for shared code) simplify imports

## External Dependencies

### Database
- **PostgreSQL**: Primary database (connection via `DATABASE_URL` environment variable)
- **Drizzle Kit**: Database migration tooling (`npm run db:push`)

### Third-Party Services
- **Google Generative AI**: Available as a dependency for AI-powered diagnostic conversations
- **OpenAI**: Alternative AI provider available
- **Nodemailer**: Email functionality
- **Stripe**: Payment processing capability

### Key NPM Packages
- `@tanstack/react-query`: Server state management
- `framer-motion`: Animation library
- `zod`: Schema validation
- `drizzle-orm` / `drizzle-zod`: Database ORM and validation integration
- Full Radix UI component suite for accessible UI primitives