import dotenv from "dotenv";
dotenv.config();

import { app } from "./server";
import { ensureRedis } from "./redis";

const PORT = Number(process.env.PORT || 4000);

async function main() {
  try {
    // connect to Redis before listening
    await ensureRedis();

    app.listen(PORT, () => {
      console.log(`✅ API listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

main();