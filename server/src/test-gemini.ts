import dotenv from "dotenv";
import path from "path";

// Load dotenv
dotenv.config({ path: path.join(__dirname, "../.env") });

import { generatePlan } from "./services/gemini";

async function run() {
  const profile = {
    roles: ["Developer/Engineer"],
    goals: ["Make better use of my time", "Build new skills", "Boost my career"],
    interests: ["AI", "Design", "Software Engineering"],
    learningPreferences: ["Bite-sized lessons", "Visual explanations", "Real-world examples"]
  };

  console.log("Calling generatePlan...");
  try {
    const result = await generatePlan("Guitar", "hobbyist", profile);
    console.log("SUCCESS!");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("FAILED!");
    console.error(error);
  }
}

run();
