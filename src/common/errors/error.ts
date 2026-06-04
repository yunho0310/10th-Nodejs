import { AppError } from "./app.error.js";

export class DuplicateUserEmailError extends AppError {
 constructor(message: string, data?: unknown) {
  super({
   errorCode: "U001",
   statusCode: 409,
   message,
   data,
  });
 }
}

export class HashingPassword extends AppError {
 constructor(message: string, data?: unknown) {
  super({
   errorCode: "U002",
   statusCode: 500,
   message,
   data,
  });
 }
}

export class AlreadyChallenging extends AppError {
 constructor(message: string, data?: unknown) {
  super({
   errorCode: "U003",
   statusCode: 402,
   message,
   data,
  });
 }
}
