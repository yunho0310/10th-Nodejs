import * as express from "express";

declare global {
  namespace Express {
    interface Response {
      error: (params: {
        errorCode: string;
        message: string | null;
        data?: any;
      }) => void;
    }
  }
}
