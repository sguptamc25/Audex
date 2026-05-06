# 🎵 Audex — Music Discovery & Review Platform

Audex is a full-stack music discovery, rating, and review platform where users can search for albums, songs, and artists, rate them on a 5-star scale (with half-star precision), write in-depth reviews, and explore community-driven top charts filtered by genre and year.

---

## 📸 Features

- **Search** — Search for albums, songs, and artists powered by the Deezer API.
- **Album & Song Pages** — Rich detail pages showing artwork, tracklists, and community reviews.
- **Artist Pages** — Browse an artist's discography and top tracks.
- **Star Ratings** — Rate any album or song on a 0.5–5.0 scale with interactive half-star selection.
- **Reviews** — Write, edit, and delete text reviews (one review per item per user).
- **Top Charts** — Community-driven charts for top-rated albums, songs, and artists, filterable by genre and release year.
- **New Releases** — Browse the latest music releases.
- **User Profiles** — View any user's reviews and ratings on their public profile.
- **Authentication** — Email/password sign-up and login via Supabase Auth.
- **Dark Mode** — Sleek dark-themed UI with glassmorphism and gradient accents.

---

## 🛠️ Tech Stack

| Layer         | Technology                                                  |
| ------------- | ----------------------------------------------------------- |
| Framework     | [Next.js 16](https://nextjs.org/) (App Router, RSC)        |
| Language      | [TypeScript 5](https://www.typescriptlang.org/)             |
| UI Library    | [React 19](https://react.dev/)                              |
| Styling       | [Tailwind CSS 4](https://tailwindcss.com/) + PostCSS        |
| Components    | [shadcn/ui](https://ui.shadcn.com/) (Base Nova style)       |
| Icons         | [Lucide React](https://lucide.dev/)                         |
| Database      | [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS) |
| External API  | [Deezer API](https://developers.deezer.com/) (music data)   |
| Fonts         | [Geist & Geist Mono](https://vercel.com/font)               |
| Linting       | ESLint 9 with `eslint-config-next`                          |

---

## 📋 Prerequisites

Make sure you have the following installed before setting up the project:

- **Node.js** — v18.17 or later ([Download](https://nodejs.org/))
- **npm** — v9 or later (bundled with Node.js)
- **Git** — ([Download](https://git-scm.com/))
- **Supabase Account** — Free tier is sufficient ([Sign up](https://supabase.com/))

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/audex.git
cd audex
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root with the following variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

> **Where to find these values:**
>
> 1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
> 2. Select your project → **Settings** → **API**.
> 3. Copy the **Project URL**, **anon (public) key**, and **service_role (secret) key**.

> ⚠️ **Never commit your `.env.local` file or expose your `SUPABASE_SERVICE_ROLE_KEY` publicly.**

### 4. Set Up the Database

The project uses the following Supabase tables. You can create them via the Supabase SQL Editor:

#### `profiles` table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `ratings` table

```sql
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  api_item_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('album', 'song')),
  score NUMERIC(2,1) NOT NULL CHECK (score >= 0.5 AND score <= 5.0),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, api_item_id, type)
);
```

#### `reviews` table

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  api_item_id TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('album', 'song')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, api_item_id, type)
);
```

#### Row Level Security (RLS)

Enable RLS on all tables and add appropriate policies:

```sql
-- Profiles: anyone can read, users can update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Ratings: anyone can read, authenticated users can insert/update/delete their own
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ratings are viewable by everyone" ON ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON ratings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own ratings" ON ratings FOR DELETE USING (auth.uid() = user_id);

-- Reviews: anyone can read, authenticated users can insert/update/delete their own
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone" ON reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert reviews" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON reviews FOR DELETE USING (auth.uid() = user_id);
```

### 5. Seed the Database (Optional)

Populate the database with dummy users and reviews for testing:

```bash
npx tsx scripts/seed.ts
```

> This creates ~20 test users and seeds ratings/reviews for popular albums. Requires the `SUPABASE_SERVICE_ROLE_KEY` in your `.env.local`.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the app.

---

## 📂 Project Structure

```
audex/
├── public/                  # Static assets (SVGs, favicon)
├── scripts/                 # Database seeding scripts
│   ├── seed.ts              # Main seed script (users + reviews)
│   ├── massive_seed.ts      # Large-scale data seeding
│   ├── clean_db.ts          # Database cleanup utility
│   └── ...                  # Additional seed helpers
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── layout.tsx       # Root layout (Navbar, fonts, global styles)
│   │   ├── page.tsx         # Home / landing page
│   │   ├── globals.css      # Global styles & Tailwind config
│   │   ├── album/           # Album detail pages
│   │   ├── song/            # Song detail pages
│   │   ├── artist/          # Artist pages
│   │   ├── charts/          # Top charts (albums, songs, artists)
│   │   ├── new-releases/    # New music releases
│   │   ├── search/          # Search results page
│   │   ├── user/            # User profile pages
│   │   ├── login/           # Login page
│   │   └── signup/          # Signup page
│   ├── components/          # Reusable React components
│   │   ├── Navbar.tsx       # Navigation bar with auth state
│   │   ├── ReviewForm.tsx   # Review creation/editing form
│   │   ├── StarRating.tsx   # Interactive star rating component
│   │   ├── GenreFilter.tsx  # Genre filter dropdown
│   │   ├── YearFilter.tsx   # Year filter dropdown
│   │   ├── LoginToReviewLink.tsx
│   │   └── ui/              # shadcn/ui primitives (Button, etc.)
│   └── lib/                 # Utility libraries
│       ├── supabase/
│       │   └── server.ts    # Server-side Supabase client
│       ├── spotify.ts       # Deezer API integration helpers
│       └── utils.ts         # General utility functions (cn, etc.)
├── .env.local               # Environment variables (not committed)
├── .gitignore               # Git ignore rules
├── components.json          # shadcn/ui configuration
├── eslint.config.mjs        # ESLint configuration
├── next.config.ts           # Next.js configuration
├── postcss.config.mjs       # PostCSS configuration (Tailwind)
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies & scripts
└── seed.sql / seed_songs.sql # SQL seed data dumps
```

---

## 📜 Available Scripts

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the development server (port 3000) |
| `npm run build`   | Create an optimized production build     |
| `npm run start`   | Start the production server              |
| `npm run lint`    | Run ESLint on the codebase               |
| `npx tsx scripts/seed.ts` | Seed the database with test data  |

---

## 🌐 External API

Audex uses the **Deezer API** (free, no API key required) to fetch:

- Album metadata, artwork, and tracklists
- Song details and previews
- Artist information and discography
- Genre classifications
- Search results across albums, songs, and artists

API Base URL: `https://api.deezer.com`

---

## 🧑‍💻 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is developed as part of the **MCA Semester 2 — Mini Project 2** at **VJTI, Mumbai**.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) — React framework for production
- [Supabase](https://supabase.com/) — Backend-as-a-Service (Postgres + Auth)
- [Deezer API](https://developers.deezer.com/) — Music metadata provider
- [shadcn/ui](https://ui.shadcn.com/) — Beautiful component library
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS framework
- [Lucide](https://lucide.dev/) — Icon library
