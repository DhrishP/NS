import { type Request, type Response } from "express";

export abstract class BaseController {
  public abstract execute(req: Request, res: Response): Promise<void | any>;

  protected ok<T>(res: Response, dto?: T) {
    if (!!dto) {
      return res.status(200).json(dto);
    } else {
      return res.sendStatus(200);
    }
  }

  protected created(res: Response) {
    return res.sendStatus(201);
  }
}
