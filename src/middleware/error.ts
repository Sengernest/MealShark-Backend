import { Request, Response, NextFunction } from "express";
import { NotFoundError, UnauthorizedError } from "../errors/errors";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: "Not found" });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  return res.status(500).json({ error: "Internal server error", message: err });
}
