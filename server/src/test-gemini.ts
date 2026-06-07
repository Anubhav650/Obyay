import dotenv from "dotenv";
import path from "path";

// Load dotenv
dotenv.config({ path: path.join(__dirname, "../.env") });

import { generatePlan } from "./services/gemini";

async function run() {
  console.log("Calling generatePlan...");
  try {
    const result = await generatePlan("Guitar", "hobbyist");
    console.log("SUCCESS!");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("FAILED!");
    console.error(error);
  }
}

run();
