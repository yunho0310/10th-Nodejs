import passport from "passport";
import { googleStrategy, jwtStrategy } from "./auth.config.js";
import { prisma } from "./db.config.js";
import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import { success, fail } from "./common/responses/response.js";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import { RegisterRoutes } from "./generated/routes.js";
import { AppError } from "./common/errors/app.error.js";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";

dotenv.config();

console.log("구글 ID 확인:", process.env.PASSPORT_GOOGLE_CLIENT_ID);
console.log("구글 SECRET 확인:", process.env.PASSPORT_GOOGLE_CLIENT_SECRET);

passport.use(googleStrategy);
passport.use(jwtStrategy);

const app: Express = express();
const port = process.env.PORT || 3000;
const isLogin = passport.authenticate("jwt", { session: false });

declare namespace Express {
    interface Response {
        success: <T>(data: T) => this;
        error: (args: {
            errorCode?: string | null;
            message?: string | null;
            data?: unknown;
        }) => Response;
    }
}

/**
 * 1. 보안 및 기본 미들웨어
 */
app.use(
    cors({
        origin: "http://127.0.0.1:5500",
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }),
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));
app.use(passport.initialize());

/**
 * 2. 공통 응답 커스텀 미들웨어
 */
app.use((req: Request, res: Response, next: NextFunction) => {
    res.success = function <T>(this: Response, data: T) {
        return this.json(success(data));
    };

    res.error = function (
        this: Response,
        {
            errorCode,
            message,
            data,
        }: {
            errorCode?: string | null;
            message?: string | null;
            data?: unknown;
        },
    ) {
        return this.json(
            fail(
                errorCode ?? "UNKNOWN_ERROR",
                message ?? "알 수 없는 오류",
                data,
            ),
        );
    };

    next();
});
/**
 * 3. 라우트 설정
 */
const router = express.Router();
const swaggerFile = JSON.parse(
    fs.readFileSync(path.resolve("dist/swagger.json"), "utf8"),
);

RegisterRoutes(router);
app.use("/api/v1", router);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.get("/", (req, res) => res.send("API Server is Running!"));

app.get(
    "/oauth2/login/google",
    passport.authenticate("google", { session: false }),
);

app.get(
    "/oauth2/callback/google",
    passport.authenticate("google", {
        session: false,
        failureRedirect: "/login-failed",
    }),
    (req, res) => {
        res.status(200).json({ success: true, tokens: req.user });
    },
);

app.get("/mypage", isLogin, (req, res) => {
    const user = req.user as { name: string };
    res.status(200).success({
        message: `인증 성공! ${user.name}님의 마이페이지입니다.`,
        data: user,
    });
});

/**
 * 4. 에러 핸들링 미들웨어
 */
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(err);

    if (err.status === 400 && err.fields) {
        return res.status(400).error({
            errorCode: "VALIDATION_ERROR",
            message: "입력값 검증에 실패했습니다.",
            data: err.fields,
        });
    }

    res.status(err.statusCode || 500).error({
        errorCode: err.errorCode || "INTERNAL_SERVER_ERROR",
        message: err.message || "서버 내부 오류가 발생했습니다.",
        data: err.data || null,
    });
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
