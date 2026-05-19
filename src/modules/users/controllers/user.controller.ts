import {
    Body,
    Controller,
    Get,
    Middlewares,
    Post,
    Request,
    Route,
    Tags,
    SuccessResponse,
    Response,
} from "tsoa";
import { UserSignUpRequest, UserSignUpResponse } from "../dtos/user.dto.js";
import { userSignUp } from "../services/user.service.js";
import {
    ApiResponse,
    success,
    ApiErrorResponse,
    fail,
} from "../../../common/responses/response.js";
import { authorizeUser } from "../../../common/middlewares/auth.middleware.js";
import { Request as ExpressRequest } from "express";

// 에러 발생 시의 응답 타입을 명확히 정의 (Swagger 문서화용)

@Route("users")
@Tags("Users (사용자 및 인증 관련 API)")
export class UserController extends Controller {
    /**
     * 새로운 사용자를 시스템에 등록합니다.
     * @summary 회원가입 API
     * @param body 회원가입에 필요한 이메일, 비밀번호 등 필수 정보
     */
    @Post("signup")
    @SuccessResponse(200, "회원가입 성공")
    @Response<ApiErrorResponse>(
        400,
        "Bad Request (중복된 이메일 또는 유효성 검사 실패)",
        {
            resultType: "FAIL",
            error: {
                errorCode: "EMAIL_DUPLICATED",
                reason: "이미 가입된 이메일 주소입니다.",
            },
            data: null,
        },
    )
    public async handleUserSignUp(
        @Body() body: UserSignUpRequest,
    ): Promise<ApiResponse<UserSignUpResponse>> {
        console.log("회원가입을 요청했습니다!");
        console.log("body:", body);
        const user = await userSignUp(body);
        return success(user); // { resultType: "SUCCESS", error: null, data: user } 형태로 응답 구조화
    }

    /**
     * 비회원(게스트)이 접근 가능한 안내 페이지 데이터를 반환합니다.
     * @summary 게스트 페이지 조회 API
     */
    @Get("guest")
    @SuccessResponse(200, "게스트 페이지 조회 성공")
    public async handleGuestPage(): Promise<
        ApiResponse<{ message: string; loginRequired: boolean }>
    > {
        return success({
            message: "이 페이지는 로그인이 필요 없는 게스트 페이지입니다.",
            loginRequired: false,
        });
    }

    /**
     * 인증이 필요한 페이지 접근 실패 시 리다이렉트되어 도달하는 안내 페이지입니다.
     * @summary 로그인 유도 안내 페이지 API
     */
    @Get("login")
    @SuccessResponse(200, "로그인 안내 페이지 조회 성공")
    public async handleLoginPage(): Promise<ApiResponse<{ message: string }>> {
        return success({
            message: "로그인이 필요한 페이지에서 튕겨나오면 여기로 옵니다.",
        });
    }

    /**
     * 로그인한 회원만 접근 가능한 마이페이지 정보를 조회합니다.
     * 쿠키 기반의 사용자 검증 프로세스가 포함되어 있습니다.
     * @summary 마이페이지 조회 API (인증 필요)
     */
    @Get("mypage")
    @Middlewares(authorizeUser())
    @SuccessResponse(200, "마이페이지 조회 성공")
    @Response<ApiErrorResponse>(
        401,
        "Unauthorized (인증 실패 또는 쿠키 누락)",
        {
            resultType: "FAIL",
            error: {
                errorCode: "UNAUTHORIZED",
                reason: "인증 정보(쿠키)가 유효하지 않거나 유실되었습니다.",
            },
            data: null,
        },
    )
    public async handleMypage(
        @Request() req: ExpressRequest,
    ): Promise<ApiResponse<{ username: string; message: string }>> {
        return success({
            username: req.cookies.username,
            message: "환영합니다! 이 페이지는 로그인한 사람만 볼 수 있습니다.",
        });
    }

    /**
     * 테스트를 위해 시스템에 로그인 쿠키(`username`)를 강제로 발급합니다.
     * @summary 로그인 쿠키 생성 API (테스트용)
     */
    @Get("set-login")
    @SuccessResponse(200, "로그인 쿠키 발급 성공")
    public async handleSetLogin(
        @Request() req: ExpressRequest,
    ): Promise<ApiResponse<string>> {
        req.res!.cookie("username", "UMC10th", {
            maxAge: 3600000,
            httpOnly: true,
        });

        return success("로그인 쿠키(username=UMC10th) 생성 완료!");
    }

    /**
     * 클라이언트에 저장된 로그인 쿠키를 파기하여 로그아웃 처리를 수행합니다.
     * @summary 로그아웃 API (쿠키 삭제)
     */
    @Get("set-logout")
    @SuccessResponse(200, "로그아웃 성공")
    public async handleSetLogout(
        @Request() req: ExpressRequest,
    ): Promise<ApiResponse<string>> {
        req.res!.clearCookie("username");
        return success("로그아웃 완료 (쿠키 삭제).");
    }
}
