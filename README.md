# ⚙ StacksPlays Backend

This is the *backend API* for [StacksPlays](https://github.com/POA200/stacksplays), a decentralized gaming platform built on the *Stacks blockchain*.  
It powers *game scheduling, leaderboards, admin tools, and secure API endpoints* consumed by the React frontend.

---

## 🚀 Features

- *Health Check* → /health endpoint for monitoring.  
- *Game Scheduler API*  
  - Fetch game state (open/closed, countdown).  
  - Reset or schedule custom open/close times (admin-only).  
- *Leaderboard API*  
  - Fetch leaderboard by period (daily, weekly, season).  
  - Submit/update scores (admin-only for now).  
- *Security*  
  - Admin endpoints protected via x-admin-key middleware.  
  - CORS + Helmet for hardened HTTP security.  
- *Validation* → Zod schemas for clean request validation.  

---

## 🛠 Tech Stack

- *Language:* TypeScript  
- *Framework:* Express.js  
- *Validation:* Zod  
- *Security:* Helmet, CORS  
- *Auth:* Admin key middleware (JWT-ready)  
- *Dev Tools:* ts-node-dev, dotenv  

---

## 📂 Project Structure

backend/ ├── src/ │   ├── index.ts             # Entry point │   ├── server.ts            # App + middleware │   ├── routes/ │   │   ├── games.ts         # Game scheduling endpoints │   │   └── leaderboard.ts   # Leaderboard endpoints │   ├── services/ │   │   ├── game.services.ts # Game state logic │   │   └── leaderboard.service.ts │   └── middleware/ │       └── admin.ts         # Admin key guard ├── .env                     # Local environment config ├── package.json └── tsconfig.json

---

## 🔑 Environment Variables

Create a .env file in the backend root:

```bash
PORT=4000
CORS_ORIGIN= https://stacksplays-frontend.vercel.app  # frontend origin
ADMIN_KEY=123456789                 # admin header key
JWT_SECRET=super-secret-key         # for future JWT auth

Ensure .env is listed in .gitignore (for security).


---

💻 Installation & Setup

# Clone the repo
git clone https://github.com/your-username/stacksplays-backend.git
cd stacksplays-backend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
npm start

The server will run at http://localhost:4000.


---

🔌 API Endpoints

Health

GET /health → { ok: true }


Games

GET /api/games/:id
→ Fetch public game state (open/closed, countdown).

POST /api/games/:id/reset (admin)
→ Reset game: open now, close in 7 days.

POST /api/games/:id/schedule (admin)
→ Set custom opensAt / closesAt (timestamps).


Leaderboard

GET /api/leaderboard?period=season&offset=0&limit=25
→ Fetch leaderboard.

POST /api/leaderboard/submit (admin)
→ Upsert a player score.



---

📸 Example Requests

# Health
curl http://localhost:4000/health

# Fetch game
curl http://localhost:4000/api/games/word-search

# Reset game (admin)
curl -X POST http://localhost:4000/api/games/word-search/reset \
  -H "x-admin-key: 123456789"

# Fetch leaderboard
curl http://localhost:4000/api/leaderboard?period=season&limit=10


---

🛡 Security & Best Practices

.env must never be committed.

Admin endpoints require a header:

x-admin-key: <ADMIN_KEY>

Use strong values for JWT_SECRET if JWT auth is enabled.

CORS is restricted to frontend origin via CORS_ORIGIN.



---

📌 Roadmap

[ ] Replace in-memory storage with Postgres/Redis.

[ ] Add JWT-based user authentication.

[ ] Add WebSocket or SSE for real-time leaderboard updates.

[ ] Expose player “around me” rank API.

[ ] Integrate Stacks smart contract calls.



---

👤 Author

Developed by iPeter (StacksPlays Project).
Backend for Stacks blockchain GameFi dApp.