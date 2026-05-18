import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import { RegisterRoutes } from "./generated/routes.js"; // tsoa가 생성한 파일
import { AppError } from "./common/errors/app.error.js";
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

/**
 * 1. 보안 및 기본 미들웨어 (최상단 배치)
 */
// CORS 설정을 하나로 합치고 가장 위로 올립니다.
app.use(
 cors({
  origin: "http://127.0.0.1:5500", // Live Server 주소 명시
  credentials: true, // 쿠키나 인증 헤더 허용 시 필수
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
 }),
);

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static("public"));

/**
 * 2. 공통 응답 커스텀 미들웨어
 */
app.use((req: Request, res: Response, next: NextFunction) => {
 res.error = function ({ errorCode = null, message = null, data = null }) {
  return this.json({
   resultType: "FAILED",
   error: { errorCode, message, data },
   data: null,
  });
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

// tsoa 라우트 등록
RegisterRoutes(router);

// 버전 접두사 부여
app.use("/api/v1", router);
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));

// 기본 경로 테스트
app.get("/", (req, res) => res.send("API Server is Running!"));

/**
 * 4. 에러 핸들링 미들웨어 (최하단 배치)
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
