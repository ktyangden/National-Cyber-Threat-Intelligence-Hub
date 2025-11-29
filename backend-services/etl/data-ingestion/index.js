// Stream data from Json as alternative for Honepot real-time logs

import fs from "fs";
import { Kafka } from "kafkajs";

const kafka = new Kafka({ brokers: ["192.168.67.1:9092"] });
const producer = kafka.producer();

async function streamLogs() {
  await producer.connect();
  console.log("Kafka Producer connected. Reading JSON logs...");

  // Read and parse logs
  const logs = JSON.parse(fs.readFileSync("data/logs.json", "utf8"));
  console.log(`Loaded ${logs.length} logs. Starting stream...`);

  for (let i = 0; i < logs.length; i++) {
    const log = logs[i];

    // Calculate delay based on timestamp difference with previous log
    if (i > 0) {
      const prevTime = new Date(logs[i - 1].timestamp).getTime();
      const currTime = new Date(log.timestamp).getTime();

      let delay = currTime - prevTime;

      // Avoid instant flood — set minimum delay
      if (delay < 500) delay = 500;

      console.log(`Waiting ${delay} ms before sending next log...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    // Change timestamp to current
    log.timestamp = Date.now();

    // Send log to Kafka topic
    await producer.send({
      topic: "logs",
      messages: [{ value: JSON.stringify(log) }],
    });

    console.log("Produced:", log);
  }

  await producer.disconnect();
  console.log("Done streaming all JSON logs to Kafka!");
}

streamLogs().catch(console.error);

