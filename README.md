# 🏮 Remindly 🏮 *
> *Practice smarter. Remember longer. Race against yourself.*

A spaced-repetition practice scheduler built for developers grinding DSA and anyone serious about turning hard things into second nature. You define your syllabus — Flowtica figures out when to bring it back.

---

## ✨ Why this exists

Most people don't fail because they stopped caring. They fail because they forgot to come back.

Flowtica solves the "I learned it once and then it vanished" problem by scheduling your practice around how memory actually works — showing you the right pattern at the right time, every time.

---

## 🚀 Features

- **Spaced-repetition engine** — patterns resurface on an intelligent schedule based on your practice history
- **Custom syllabus** — define your own paths and problems, not someone else's curriculum
- **Weekly & monthly calendar views** — see your practice load at a glance
- **Personal profile & leaderboard** — track your streak, sessions, and mastered patterns. You're running a race against yourself
- **Cross-device sync** — log in from your phone or laptop and pick up exactly where you left off
- **Magic link auth** — no passwords. Just your email and a click

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Auth | Supabase Magic Link |
| Database | Supabase (Postgres + RLS) |
| Hosting | Lovable Cloud |

---

## 🗄️ Database Schema

| Table | Purpose |
|---|---|
| `paths` | Learning tracks / syllabi |
| `patterns` | Individual concepts or problems |
| `problems` | Specific practice items |
| `practice_events` | Log of every session |
| `scheduled_occurrences` | When each item is due next |
| `user_preferences` | Profile, nickname, avatar |

All tables are secured with **Row Level Security** — your data is yours alone.

---

## 🏁 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/your-username/your-repo-name.git
cd your-repo-name

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Add your Supabase URL and anon key

# 4. Run locally
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📍 Roadmap

- [ ] Streak protection / grace days
- [ ] Notification reminders (email or push)
- [ ] Public profile sharing
- [ ] Mobile app (PWA)
- [ ] Community-shared syllabi / pattern packs

---

## 🤝 Contributing

This project is an MVP and actively growing. Bug reports, feature ideas, and PRs are all welcome — open an issue and let's talk.

---

## 📄 License

MIT — use it, fork it, build on it.

---

*Built with curiosity and vibe coding. One pattern at a time.*
