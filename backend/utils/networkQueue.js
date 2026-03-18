const Redis = require("ioredis");

const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

const QUEUE_NAME = "network-queue";

async function enqueueNetwork(user_id) {
  const lockKey = `network:lock:${user_id}`;

  // 🔐 Prevent duplicate clicks (atomic)
  const isNew = await redis.set(lockKey, "1", "NX", "EX", 300);

  if (!isNew) {
    console.log(`User ${user_id} already queued/processing`);
    return false;
  }

  // 📥 Add to queue
  await redis.lpush(
    QUEUE_NAME,
    JSON.stringify({ user_id })
  );

  console.log(`Queued network creation for user ${user_id}`);
  return true;
}

module.exports = { enqueueNetwork };
