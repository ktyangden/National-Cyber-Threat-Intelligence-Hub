// This Server requests [ML|Log|Alert]-Service as per requirement

import { Kafka } from "kafkajs";
import axios from "axios";

// Kafka consumer 
const kafka = new Kafka({ brokers: ["localhost:9092"] });
const consumer = kafka.consumer({ groupId: "log-consumers" });

// Store logs in-memory for the last 1 minute
let recentLogs = [];

// Helper function to clean up old logs
function pruneOldLogs() {
  const oneMinuteAgo = Date.now() - 60 * 1000;
  recentLogs = recentLogs.filter(
    (log) => log.timestamp && new Date(log.timestamp).getTime() > oneMinuteAgo
  );
}

// COnnecting to Kafka Consumer
await consumer.connect();
await consumer.subscribe({ topic: "logs", fromBeginning: true });
console.log("Listening to Kafka...");

// Consume Kafka logs -> Analyze -> Forward to Log Service (and Alert if needed)
await consumer.run({
  eachMessage: async ({ message }) => {
    const log = JSON.parse(message.value.toString());

    // Prune old logs before pushing new one
    pruneOldLogs();

    // Add the current log to recent logs buffer
    recentLogs.push(log);

    // Prepare payload for ML service
    const payload = {
      current_log: log,
      recent_logs: recentLogs,
    };

    // console.log("");
    // console.log("----------------------------------------------------------------");
    // console.log("Data for analysis:");
    // console.log(JSON.stringify(payload, null, 2));
    // console.log("----------------------------------------------------------------");
    // console.log("");

    // Send log to ML-service for Classification
    // try {
    //   const res = await axios.post("http://localhost:8000/predict", payload);

    //   // Send classified logs to Log-service
    //   try {
    //     await axios.post("http://localhost:8001/send-log", res.data);
    //   } catch (err) {
    //     console.error("Error calling Log service:", err.message);
    //   }
    // } catch (err) {
    //   console.error("Error calling ML service:", err.message);
    // }

    // Send log to ML-service for Classification
    try {
      const res = await axios.post("http://localhost:8080/micro/ml", payload);      
      const classifiedLog = res.data.classifiedLog;

      // Send classified logs to Log-service
      try {
        await axios.post("http://localhost:8080/micro/log", classifiedLog);
      } catch (err) {
        console.error("Error calling Gateway|Log:", err.message);
      }
    } catch (err) {
      console.error("Error calling Gateway|ML:", err.message);
    }
  },
});


// If attack is detected then send to Alert-service
    // if (classifiedLog.isAttack == True) {

    //   const alertData = {

    //   }

    //   try {
    //     await axios.post("http://localhost:8002/send-alert", alertData);
    //   } catch (err) {
    //     console.error("Error calling ML service:", err);
    //   }
    // }