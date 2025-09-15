import dotenv from "dotenv";
dotenv.config();

import { app } from "./server";
import { ensureRedis } from "./redis";

const PORT = Number(process.env.PORT || 4000);

async function main() {
  await ensureRedis();           // connect to Redis before listening
  app.listen(PORT, () => {
    console.log(`✅ API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});