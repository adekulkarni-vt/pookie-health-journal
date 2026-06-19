# Pookie Health Journal - Development Guidelines

## Project Overview

A cute personal journaling application for health tracking, gastritis flare monitoring, symptom tracking, and AI-powered wellness insights.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Google Gemini API
- Framer Motion

## Getting Started

### Prerequisites
- Node.js 18+
- npm/pnpm/yarn

### Installation

```bash
npm install --legacy-peer-deps
```

### Environment Setup

Copy `.env.example` to `.env.local` and configure:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                    # Next.js pages
├── components/            # React components
├── lib/                   # Utilities
├── supabase/             # Supabase config
├── gemini/               # Gemini AI setup
├── types/                # TypeScript types
└── actions/              # Server actions (planned)
docs/
├── schema.md            # Database schema
└── project-spec.md      # Full specifications
```

## Key Commands

- `npm run dev` - Start development server
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Type checking

## Current Phase

Foundation phase complete ✓
- Project structure established
- All dependencies installed
- Environment configuration ready
- Placeholder pages created
- Documentation in place

Next: Authentication and database integration

## Important Notes

- Use `--legacy-peer-deps` flag for npm install due to React 19 compatibility
- All AI and database write operations are placeholder only
- Authentication is not yet implemented
- No business logic implemented in foundation phase

## Resources

- [Project Specification](../docs/project-spec.md)
- [Database Schema](../docs/schema.md)
- [README](../README.md)
