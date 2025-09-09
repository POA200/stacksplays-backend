📄 Backend Resume Entry: StacksPlays Backend API

Role: Backend Developer
Stack: Node.js, Express, TypeScript, REST API, JWT, Helmet, CORS, Zod
Repo: (link to your GitHub backend repo once pushed)


---

🔹 Project Overview

Built a scalable backend API to power StacksPlays, a decentralized gaming platform on the Stacks blockchain. The backend manages game scheduling, user authentication, leaderboards, and admin tools for real-time casino-style and mini-game experiences.


---

🔹 Key Responsibilities

Designed and implemented RESTful API endpoints with Express.js and TypeScript.

Structured backend with modular services, routes, and middleware for maintainability.

Integrated JWT authentication and custom middleware for admin-only features.

Developed game scheduling system:

Allows admins to set game start/end times.

Provides universal countdown timers to frontend clients.


Created leaderboard service for tracking player scores and rankings.

Configured CORS & Helmet for security hardening and safe cross-origin requests.

Managed environment variables with dotenv and ensured sensitive data (.env) is excluded via .gitignore.



---

🔹 Technical Highlights

API Architecture

/api/games/:id → fetch public state (open/closed, time left).

/api/games/:id/reset → reset schedule (admin-only).

/api/games/:id/schedule → custom open/close times (admin-only).

/api/leaderboard → retrieve/update player rankings.


Utilities

zod for request validation.

Centralized services folder for game logic and leaderboard persistence.


Security

JWT-based authentication for user/admin separation.

Admin endpoints protected with requireAdmin middleware.

Environment secrets safely managed with .env.


Developer Experience

Configured ts-node-dev for live TypeScript reload in development.

Enforced typing with tsconfig.json for clean builds.

Lightweight setup: npm run dev for local testing.




---

🔹 Achievements

Delivered a restart-safe game scheduling system (time tracked via absolute UTC timestamps).

Enabled real-time leaderboard updates for competitive games.

Built a secure admin dashboard API that integrates seamlessly with the frontend.

Laid foundation for scaling into multi-game support (casino, NFT minting, WordSearch, etc.).



---

🔹 Tech Stack

Language: TypeScript

Framework: Express.js

Database: (Pluggable — can extend to Postgres, MongoDB, or Redis)

Auth: JWT, middleware-based role checks

Validation: Zod

Dev Tools: ts-node-dev, dotenv, Git/GitHub