import { type Request, type Response, type NextFunction } from "express";

const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  console.log(
    `[${new Date().toISOString()}] [${req.requestId}] ----> ${req.method} ${req.url}`,
  );

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] [${req.requestId}] <---- ${req.method} ${
        req.url
      } ${res.statusCode} ${duration}ms`,
    );
  });

  next();
};

export default loggerMiddleware;
