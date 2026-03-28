const { Worker } = require("bullmq");
const IORedis = require("ioredis");
const { spawn } = require("child_process");

const connection = new IORedis({
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
});

const worker = new Worker(
  "network-queue",
  async (job) => {
    console.log("📦 JOB RECEIVED:", job.data);

    const { userId } = job.data;

    return new Promise((resolve, reject) => {
      const process = spawn("sudo", [
        "python3",
        "/home/laxmikant/Virtual-Cyber-Labs/backend/scripts/create_user_bridges.py",
        userId.toString(),
      ]);

      process.stdout.on("data", (data) => {
        console.log(`[PYTHON]: ${data}`);
      });

      process.stderr.on("data", (data) => {
        console.error(`[PYTHON ERROR]: ${data}`);
      });

      process.on("close", (code) => {
        if (code === 0) {
          console.log(`✅ Network created for user ${userId}`);
          resolve();
        } else {
          reject(new Error(`Exit code ${code}`));
        }
      });
    });
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`✅ Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.log(`❌ Job failed: ${job.id}`, err.message);
});

console.log("🔥 Worker started...");