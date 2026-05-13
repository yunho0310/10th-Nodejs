import {
 Body,
 Controller,
 Get,
 Middlewares,
 Post,
 Request,
 Res,
 Route,
 Tags,
} from "tsoa";
import { UserSignUpRequest, UserSignUpResponse } from "../dtos/user.dto.js";
import { userSignUp } from "../services/user.service.js";
import { ApiResponse, success } from "../../../common/responses/response.js";
import { authorizeUser } from "../../../common/middlewares/auth.middleware.js";
import { Request as ExpressRequest } from "express";

@Route("users") // 라우트 경로
@Tags("Users") // Swagger 태그
export class UserController extends Controller {
 @Post("signup") // 엔드포인드 정의
 public async handleUserSignUp(
  @Body() body: UserSignUpRequest,
 ): Promise<ApiResponse<UserSignUpResponse>> {
  console.log("회원가입을 요청했습니다!");
  console.log("body:", body);
  const user = await userSignUp(body); //서비스 로직 호출
  return success(user); //성공 응답 보내기
 }

 @Get("guest")
 public async handleGuestPage(): Promise<
  ApiResponse<{ message: string; loginRequired: boolean }>
 > {
  return success({
   message: "이 페이지는 로그인이 필요 없는 게스트 페이지입니다.",
   loginRequired: false,
  });
 }

 @Get("login")
 public async handleLoginPage(): Promise<ApiResponse<{ message: string }>> {
  return success({
   message: "로그인이 필요한 페이지에서 튕겨나오면 여기로 옵니다.",
  });
 }

 @Get("mypage")
 @Middlewares(authorizeUser())
 public async handleMypage(
  @Request() req: ExpressRequest,
 ): Promise<ApiResponse<{ username: string; message: string }>> {
  // cookie-parser를 통해 가져온 쿠키 데이터 활용
  return success({
   username: req.cookies.username,
   message: "환영합니다! 이 페이지는 로그인한 사람만 볼 수 있습니다.",
  });
 }

 @Get("set-login")
 public async handleSetLogin(
  @Request() req: ExpressRequest,
 ): Promise<ApiResponse<string>> {
  // 쿠키 설정
  req.res!.cookie("username", "UMC10th", {
   maxAge: 3600000,
   httpOnly: true, // 보안을 위한 설정 추가 제안
  });

  return success("로그인 쿠키(username=UMC10th) 생성 완료!");
 }

 @Get("set-logout")
 public async handleSetLogout(
  @Request() req: ExpressRequest,
 ): Promise<ApiResponse<string>> {
  // 쿠키 삭제
  req.res!.clearCookie("username");

  return success("로그아웃 완료 (쿠키 삭제).");
 }
}
