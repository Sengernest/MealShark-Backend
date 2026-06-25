import { $ZodIssue } from "zod/v4/core";

export class NotFoundError extends Error {}
export class UnauthorizedError extends Error {}

export class ValidationError extends Error {
  public issues: $ZodIssue[];

  constructor(issues: $ZodIssue[]) {
    super(issues[0]?.message ?? "Validation error");
    this.issues = issues;
  }
}

export class AuthenticationError extends Error {}

export class BusinessError extends Error {} // Violation of business logic

export class InvariantError extends Error {} // Logically impossible state
