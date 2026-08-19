# Algerian Wordle 🇩🇿

A full-stack Wordle-style game for Algerian words, supporting both **Arabic script** and **Arabizi**. The application is built with Next.js and uses secure server-side game logic so the secret word is never exposed to the browser before the game ends.

## Features

- Arabic and Arabizi game modes
- English, French and Arabic interface languages
- RTL interface support for Arabic
- Six attempts per game
- Dynamic word lengths
- Arabic and QWERTY virtual keyboards
- Correct, present and absent letter states
- Secure credentials-based authentication
- Persistent users and game sessions
- Server-side word selection and guess evaluation
- Responsive design and tile animations

## Technology stack

- **Frontend:** Next.js, React, TypeScript and Tailwind CSS
- **Backend:** Next.js App Router route handlers
- **Database:** Supabase PostgreSQL
- **ORM:** Prisma
- **Authentication:** bcrypt, signed JWT and secure httpOnly cookies
- **Validation:** Zod
- **Deployment:** GitHub and Vercel

## How the game works

1. The player creates an account or signs in.
2. The player selects Arabic or Arabizi.
3. The server randomly selects an active word and creates a game session.
4. The client receives only the session ID and word length.
5. Every guess is sent to the server for validation and evaluation.
6. The server returns the state of each letter:
   - `correct`: right letter and right position
   - `present`: right letter but wrong position
   - `absent`: letter not present in the target word
7. The secret word is revealed only after a win or after the sixth failed attempt.

## Project structure

```text
app/
├── api/
│   ├── auth/          # Signup, login, logout and current user
│   ├── game/          # Start game and submit guess
│   └── leaderboard/   # Score-based ranking endpoint
├── game/              # Game page
├── language/          # Word-language selection
├── login/             # Login page
├── menu/              # Main menu
└── signup/            # Registration page

components/
├── AppShell.tsx       # Shared layout and UI-language controls
├── AuthForm.tsx       # Login and signup form
├── Game.tsx           # Board, keyboard and game interactions
├── LanguageSelect.tsx # Arabic and Arabizi selection
└── Menu.tsx           # Play and disconnect menu

lib/
├── api.ts             # API response helpers
├── game.ts            # Wordle letter-evaluation algorithm
├── i18n.ts            # English, French and Arabic dictionaries
├── prisma.ts          # Reusable Prisma client
├── session.ts         # Signed session-cookie management
└── validation.ts      # Zod validation schemas

prisma/
├── schema.prisma      # Database models
└── seed.ts            # Initial Arabic and Arabizi words
```

## Requirements

- Node.js 22 or later
- npm
- A free Supabase project

## Environment variables

Create a `.env` file at the project root:

```env
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@POOLER_HOST:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.PROJECT_REF:PASSWORD@POOLER_HOST:5432/postgres"
SESSION_SECRET="replace-with-a-random-secret-of-at-least-32-characters"
```

- `DATABASE_URL` uses the Supabase transaction pooler on port `6543`.
- `DIRECT_URL` uses the Supabase session pooler on port `5432` for Prisma migrations.
- `SESSION_SECRET` signs authentication cookies.

Never commit `.env` to GitHub.

## Local installation

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Word list

Initial words are defined in:

```text
prisma/seed.ts
```

After seeding, the active word list is stored in:

```text
Supabase Dashboard → Table Editor → Word
```

Each word contains:

- `text`
- `language`: `arabic` or `arabizi`
- `length`
- `isActive`

## Main API routes

| Method | Route | Purpose |
|---|---|---|
| `POST` | `/api/auth/signup` | Create a user and session |
| `POST` | `/api/auth/login` | Verify credentials and start a session |
| `POST` | `/api/auth/logout` | Clear the session cookie |
| `GET` | `/api/auth/me` | Return the authenticated user |
| `POST` | `/api/game/start` | Select a secret word and create a game |
| `POST` | `/api/game/guess` | Validate and evaluate a guess |
| `GET` | `/api/leaderboard` | Return the top users |

## Security

- Passwords are hashed with bcrypt.
- Sessions use signed JWTs stored in httpOnly cookies.
- Protected pages require an authenticated session.
- All API inputs are validated with Zod.
- The client never receives the target word during an active game.
- Guess correctness is always calculated server-side.
- Guess submission is rate-limited using the session timestamp.

## Deployment

1. Push the project to a GitHub repository.
2. Import the repository into Vercel.
3. Add `DATABASE_URL`, `DIRECT_URL` and `SESSION_SECRET` in the Vercel environment variables.
4. Apply the production migrations:

```bash
npx prisma migrate deploy
```

5. Deploy the application from Vercel.

## License

This project is available for educational and personal use. Add a license file if you plan to distribute or accept external contributions.
