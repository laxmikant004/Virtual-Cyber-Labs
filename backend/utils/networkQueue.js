const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

redis.on("connect", () => {
  console.log("[REDIS] Connected");
});

redis.on("error", (err) => {
  console.error("[REDIS ERROR]", err);
});

const QUEUE_NAME = process.env.QUEUE_NAME || "network-queue";

async function enqueueNetwork(user_id) {
  // ✅ Validate input
  if (!user_id) {
    throw new Error("Invalid user_id");
  }

  const lockKey = `network:lock:${user_id}`;

  try {
    // 🔐 Prevent duplicate clicks (atomic)
    const isNew = await redis.set(lockKey, "1", "NX", "EX", 300);

    if (!isNew) {
      console.log(`[QUEUE] User ${user_id} already queued/processing`);
      return false;
    }

    // 📥 Push job
    await redis.lpush(
      QUEUE_NAME,
      JSON.stringify({ user_id })
    );

    console.log(`[QUEUE] Job added for user ${user_id}`);
    return true;

  } catch (err) {
    console.error("[QUEUE ERROR]", err);
    throw err;
  }
}

module.exports = { enqueueNetwork };