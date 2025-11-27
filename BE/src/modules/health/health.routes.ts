import { BaseRoute } from "../base/BaseRoute";
import { HealthController } from "./health.controller";

export class HealthRoute extends BaseRoute {
  protected initializeRoutes(): void {
    const healthController = new HealthController();
    this.router.get("/health", (req, res) =>
      healthController.execute(req, res),
    );
  }
}
