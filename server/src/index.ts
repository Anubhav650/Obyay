import dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

import planRouter from "./routes/plan";
import resourcesRouter from "./routes/resources";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// ── Middleware ──────────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());

// Request logger middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method === "POST") {
    console.log("Body:", JSON.stringify(req.body, null, 2));
  }
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/plan", planRouter);
app.use("/api/resources", resourcesRouter);

// ── Global error handler ───────────────────────────────────────────────────

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "INTERNAL_SERVER_ERROR" });
});

// ── Start server ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Hobyay server listening on port ${PORT}`);
});

export default app;
