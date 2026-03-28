const { Queue } = require("bullmq");
const IORedis = require("ioredis");

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const networkQueue = new Queue("network-queue", { connection });

async function enqueueNetwork(userId) {
  const job = await networkQueue.add("create-network", {
    userId, // ✅ ALWAYS use userId
  });

  console.log("[QUEUE] Job added:", job.id);
}

module.exports = { enqueueNetwork };