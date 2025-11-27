import express, { type Express } from "express";
import sanitizerMiddleware from "./middlewares/sanitizer";
import loggerMiddleware from "./middlewares/logger";
import { HealthRoute } from "./modules/health/health.routes";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(sanitizerMiddleware);
app.use(loggerMiddleware);

const healthRoute = new HealthRoute();
app.use("/api", healthRoute.router);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
