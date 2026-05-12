<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project: 1,000 Watches

Next.js 16, React 19, Tailwind CSS v4 digital museum for iconic timepieces with Supabase backend.

## Development Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build  
- `npm run lint` — Run ESLint

## Environment Setup
- Requires `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Database: Supabase with `submissions` and `slots` tables

## MCP Configuration
- Google Stich MCP configured in `opencode.json`
- Use `google-stitch` tools when prompted
- MCP server may require authentication — run `opencode mcp auth google-stitch` if needed

## Architecture Notes
- App Router structure (Next.js 16)
- Dark mode design with amber accents
-smith Grid of 1,000 slots for watch display
- Nomination system in Phase 1, curated selection in Phase 2
