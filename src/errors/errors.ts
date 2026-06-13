import { $ZodIssue } from "zod/v4/core";

export class NotFoundError extends Error {}
export class UnauthorizedError extends Error {}

export class ValidationError extends Error {
  public issues: $ZodIssue[]

  constructor(issues: $ZodIssue[]) {
    super("Validation error")
    this.issues = issues
  }
}