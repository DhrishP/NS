import { type Request, type Response } from "express";
import { BaseController } from "../base/BaseController";
import { log } from "../../utils/logger";

export class HealthController extends BaseController {
  public async execute(req: Request, res: Response): Promise<void | any> {
    try {
      log(
        "info",
        req.requestId,
        "Health check endpoint was called successfully.",
      );
      this.ok(res, { status: "UP" });
    } catch (error) {
      log(
        "error",
        req.requestId,
        "An error occurred in the health check endpoint.",
        { error },
      );
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
}
