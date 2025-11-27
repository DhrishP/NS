import { v4 as uuidv4 } from "uuid";
import { type Request, type Response, type NextFunction } from "express";

declare module "express-serve-static-core" {
  interface Request {
    requestId: string;
  }
}

const sanitizerMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const oldJson = res.json;
  const requestId = uuidv4();
  req.requestId = requestId;

  res.json = function (data: any) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      oldJson.call(this, {
        success: true,
        data: data,
        requestId: requestId,
      });
    } else {
      oldJson.call(this, {
        success: false,
        error: data,
        requestId: requestId,
      });
    }
    return res;
  };

  next();
};

export default sanitizerMiddleware;
