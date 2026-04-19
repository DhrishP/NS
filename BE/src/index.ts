import express, { type Express } from "express";
import sanitizerMiddleware from "./middlewares/sanitizer";
import loggerMiddleware from "./middlewares/logger";
import corsMiddleware from "./middlewares/cors";
import { HealthRoute } from "./modules/health/health.routes";
import { GraphRoute } from "./modules/graph/graph.routes";
import { config } from 'dotenv';

config();

const app: Express = express();
const port = process.env.PORT || 3001;

app.use(corsMiddleware);
app.use(express.json());
app.use(sanitizerMiddleware);
app.use(loggerMiddleware);

const healthRoute = new HealthRoute();
const graphRoute = new GraphRoute();

app.use("/api", healthRoute.router);
app.use("/api", graphRoute.router);

// Add a root route so hitting the base URL doesn't return 404
app.get("/", (req, res) => {
  res.status(200).json({ status: "Success", service: "ENS Graph API" });
});

export default app;

if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
  });
}
