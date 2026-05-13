import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import { RegisterRoutes } from "./generated/routes.js"; // tsoa가 생성한 파일
import { AppError } from "./common/errors/app.error.js";

// 1. 환경 변수 설정
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// 2. 공통 응답 메서드 정의 미들웨어 (기존 유지)
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

const router = express.Router();

// tsoa 라우트를 router 객체에 등록
RegisterRoutes(router);

// 전체 라우터에 /api/v1 접두사 부여
app.use("/api/v1", router);

// 3. 미들웨어 설정
app.use(cors());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// 5. tsoa 라우트 설정
// 컨트롤러에 작성한 모든 API가 이 한 줄로 자동으로 등록됩니다.
RegisterRoutes(app);

// 6. 테스트용 단순 라우트 (필요한 경우에만 유지)
app.get("/", (req, res) => res.send("API Server is Running!"));

// 7. 에러 핸들링 미들웨어 (반드시 모든 라우트 설정 뒤에 위치)
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
 if (res.headersSent) return next(err);

 // tsoa 자체 유효성 검사 에러 처리 (예: 필수 파라미터 누락)
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

// 8. 서버 시작
app.listen(port, () => {
 console.log(`[server]: Server is running at http://localhost:${port}`);
 console.log(
  `[swagger]: API documentation available at http://localhost:${port}/docs`,
 );
});
