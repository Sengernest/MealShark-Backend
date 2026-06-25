import { Request, Response, NextFunction } from "express";
import {
  AuthenticationError,
  BusinessError,
  InvariantError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../errors/errors";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: "Not found", message: err });
  }

  if (err instanceof UnauthorizedError) {
    return res.status(403).json({ error: "Unauthorized", message: err });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: err.message,
      issues: err.issues,
    });
  }

  if (err instanceof AuthenticationError) {
    return res.status(401).json({ error: err.message });
  }

  if (err instanceof BusinessError) {
    return res.status(409).json({ error: err.message });
  }

  if (err instanceof InvariantError) {
    return res.status(500).json({ error: "Invariant error", message: err });
  }

  return res.status(500).json({ error: "Internal server error", message: err });
}
