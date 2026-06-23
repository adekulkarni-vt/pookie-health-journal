# Pookie Health Journal - Project Specification

## Project Overview

**Pookie Health Journal** is a cute, personalized health journaling application focused on comprehensive health tracking, gastritis flare monitoring, symptom tracking, and AI-powered wellness insights.

## Vision

A compassionate, beautiful, and intuitive health companion that helps users:
- Track daily health and wellness
- Monitor gastritis flares and triggers
- Record symptoms and patterns
- Receive AI-powered insights and support
- Celebrate health victories

## Core Features (Planned)

### 1. Health Journal
- Daily journaling with mood tracking
- Text-based health logging
- Rich text editing (future enhancement)
- Private, encrypted entries

### 2. Symptom Tracking
- Log symptoms with severity levels (1-10)
- Track symptom patterns over time
- Identify correlations and triggers
- Symptom history and trends

### 3. Gastritis Flare Tracking
- Dedicated flare logging
- Severity tracking
- Trigger identification
- Relief measure documentation
- Historical flare patterns

### 4. Dashboard & Analytics
- Visual health trends
- Symptom pattern analysis
- Gastritis flare timeline
- Monthly/weekly overviews
- Key metrics at a glance

### 5. AI-Powered Insights (Pookie Chat)
- Personalized wellness insights from journal entries
- Symptom pattern analysis and recommendations
- General wellness tips and encouragement
- Supportive, empathetic responses
- **Note**: No medical advice - educational only

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API
- **Authentication**: Supabase Auth (planned)
- **Deployment**: Vercel

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Home page
│   ├── dashboard/         # Dashboard pages
│   ├── ask/               # AI chat interface

│   └── globals.css        # Global styles
├── components/            # React components
│   ├── Navigation.tsx     # Main navigation
│   ├── Header.tsx         # Page header component
│   └── PlaceholderCard.tsx # Reusable card component
├── lib/
│   └── utils.ts          # Utility functions
├── supabase/             # Supabase configuration
│   ├── client.ts         # Browser client
│   └── server.ts         # Server client
├── gemini/               # Google Gemini AI setup
│   ├── client.ts         # Gemini client
│   └── prompts.ts        # AI prompt templates
├── types/                # TypeScript type definitions
│   ├── database.ts       # Database types
│   └── index.ts          # Shared types
└── actions/              # Server actions (planned)

docs/
├── schema.md            # Database schema documentation
└── project-spec.md      # This file
```

## Design System

### Color Palette (Pastel & Cute)
- **Pink**: `#FFD4E5` - Primary accent
- **Blue**: `#D4E5FF` - Secondary
- **Purple**: `#E5D4FF` - Tertiary
- **Green**: `#D4FFE5` - Success/positive
- **Yellow**: `#FFEDD4` - Warnings/highlights

### Typography
- Clean, readable sans-serif
- Friendly, approachable tone

### Components
- Smooth animations with Framer Motion
- Accessible UI components from shadcn/ui
- Mobile-first responsive design

## Security & Privacy

- End-to-end encrypted for sensitive health data (future)
- Row-level security (RLS) on database tables
- Supabase Auth integration (planned)
- No third-party data sharing
- HIPAA compliance considerations (future)

## Data Ownership & Compliance

- User owns all health data
- No AI training on user data
- Transparent AI operations
- GDPR & CCPA compliant design

## Deployment

- Target: Vercel
- Database: Supabase Cloud
- Environment variables managed via Vercel dashboard
- CI/CD: GitHub Actions (future setup)

## Development Phases

### Phase 1: Foundation (Current)
- ✅ Project setup and structure
- ✅ Basic routing and pages
- ✅ Component library setup
- ⏳ Environment configuration

### Phase 2: Core Features (Next)
- Authentication system
- Journal entry creation/editing
- Symptom tracking UI
- Dashboard implementation

### Phase 3: AI Integration
- Gemini API integration
- Chat interface
- Insight generation
- Pattern analysis

### Phase 4: Polish & Launch
- Performance optimization
- Testing and QA
- Design refinements
- Vercel deployment

## Future Enhancements

- Mobile app (React Native)
- Wearable device integration
- Export/share reports
- Community features
- Advanced analytics
- Health provider integration
- Medication tracking
- Food/diet logging

## Performance Targets

- LCP: < 2.5s
- FID: < 100ms
- CLS: < 0.1
- Perfect Lighthouse scores

## Success Metrics

- User retention
- Daily active users
- Journal entry consistency
- Feature adoption rates
- User satisfaction scores

## Notes

- This is a foundation-only phase - no business logic implemented yet
- All AI integration is placeholder
- Database writes are not yet implemented
- Authentication pending Supabase setup
- Production-ready structure in place for rapid feature development
