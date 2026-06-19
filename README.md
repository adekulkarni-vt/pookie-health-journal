# Pookie Health Journal

A cute personal journaling application focused on health tracking, gastritis flare tracking, symptom tracking, and AI-powered insights.

## Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm/yarn
- Supabase account
- Google Gemini API key

### Installation

1. **Install dependencies**:

```bash
npm install
```

2. **Set up environment variables**:

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `GEMINI_API_KEY` - Google Gemini API key

3. **Start development server**:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- **src/app/** - Next.js pages and layout
- **src/components/** - Reusable React components
- **src/lib/** - Utility functions
- **src/supabase/** - Supabase client configuration
- **src/gemini/** - Google Gemini AI setup
- **src/types/** - TypeScript type definitions
- **docs/** - Documentation and specs

## Available Routes

- `/` - Home page
- `/dashboard` - Analytics and trends
- `/ask` - AI chat interface (Pookie)
- `/wins` - Health achievements

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Supabase** - Database & Auth
- **Google Gemini** - AI insights
- **Framer Motion** - Animations

## Development

```bash
# Build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## Documentation

- [Database Schema](./docs/schema.md) - Database structure and tables
- [Project Specification](./docs/project-spec.md) - Complete feature and design overview

## Current Status

🚀 **Foundation Phase** - Project structure and boilerplate complete. Features coming soon.

### What's Included

✅ Next.js 15 with App Router  
✅ TypeScript configuration  
✅ Tailwind CSS with custom pastel colors  
✅ shadcn/ui components ready  
✅ Supabase client setup  
✅ Google Gemini client setup  
✅ Reusable component library  
✅ Placeholder pages for all routes  
✅ Responsive navigation  
✅ Project documentation  

### What's Next

⏳ Authentication system  
⏳ Database tables and migrations  
⏳ Journal entry features  
⏳ Symptom tracking  
⏳ AI insights integration  
⏳ Dashboard analytics  

## Contributing

This is a personal project. Development follows the phases outlined in [project-spec.md](./docs/project-spec.md).

## License

MIT

---

Made with 💚 for better health tracking
