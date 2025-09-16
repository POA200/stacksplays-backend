import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",  // Make sure this works with Render's Redis
  port: Number(process.env.REDIS_PORT) || 6379,  // Same here
  password: process.env.REDIS_PASSWORD, // if you have a password set
});

export const ensureRedis = async () => {
  try {
    await redis.ping();  // Test Redis connection
    console.log("✅ Connected to Redis");
  } catch (err) {
    console.error("❌ Failed to connect to Redis", err);
    process.exit(1); // Exit if Redis isn't available
  }
};

export default redis;