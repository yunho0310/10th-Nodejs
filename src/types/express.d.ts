// src/types/express.d.ts
import { Response } from "express";

declare module "express-serve-static-core" {
    interface Response {
        success: <T>(data: T) => this;
        error: (args: {
            errorCode?: string | null;
            message?: string | null;
            data?: unknown;
        }) => this;
    }
}

export {};
