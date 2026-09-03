# 1,000 Watches

The definitive digital museum of iconic timepieces.

## Features

- **The Gallery**: A grid of 1,000 slots representing the history of horology.
- **Nomination System**: Allows enthusiasts to suggest iconic watches for the archive.
- **Community Contributions**: Upload watch photos, edit detailed specifications, and vote for favorite models.
- **Premium Design System**: Light and Dark mode luxury aesthetic with Playfair Display serif headings and amber accents.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Database**: Supabase
- **Typography**: Playfair Display (Serif) & Plus Jakarta Sans (Sans-Serif)

## Getting Started

1.  **Clone the repository**.
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Configure Environment Variables**:
    Create a `.env.local` file in the root and add your Supabase credentials:
    ```
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```
4.  **Run the development server**:
    ```bash
    npm run dev
    ```

## Database Schema (Supabase)

Execute the following SQL in your Supabase SQL Editor to set up the necessary tables:

```sql
-- Table for watch nominations
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for the 1,000 slots
CREATE TABLE slots (
  id INTEGER PRIMARY KEY, -- 1 to 1000
  brand TEXT,
  model TEXT,
  year INTEGER,
  status TEXT DEFAULT 'empty' CHECK (status IN ('empty', 'filled'))
);

-- Optional: Initialize 1,000 empty slots
INSERT INTO slots (id, status)
SELECT generate_series(1, 1000), 'empty';
```

## Deployment

This project is optimized for deployment on **Vercel**.
