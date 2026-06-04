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
import { StatusCodes } from "http-status-codes";
import {
    UserSignUpRequest,
    UserSignUpResponse,
    SocialAdditionalInfoRequest,
    SocialAdditionalInfoResponse,
} from "../dtos/user.dto.js";
import { userSignUp, socialAdditionalInfo } from "../services/user.service.js";
import {
    ApiResponse,
    success,
    ApiErrorResponse,
    fail,
} from "../../../common/responses/response.js";
import { authorizeUser } from "../../../common/middlewares/auth.middleware.js";
import { Request as ExpressRequest } from "express";

@Route("users")
@Tags("Users (사용자 및 인증 관련 API)")
export class UserController extends Controller {
    /**
     * 새로운 사용자를 시스템에 등록합니다.
     * @summary 일반 회원가입 API
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
        return success(user);
    }

    /**
     * 구글 소셜 로그인 연동 완료 후, 최초 유저의 필수 정보(이름, 닉네임, 메일, 전화번호, 생년월일 등)를 추가 등록합니다.
     * @summary 소셜 가입자 추가 정보 등록 API
     * @param body 소셜 회원 식별 ID 및 추가 기입 프로필 정보
     */
    @Post("oauth/additional-info")
    @SuccessResponse(200, "소셜 추가 정보 등록 성공")
    @Response<ApiErrorResponse>(400, "Bad Request (유효성 검사 실패 위치)", {
        resultType: "FAIL",
        error: {
            errorCode: "VALIDATION_ERROR",
            reason: "입력값 검증에 실패했습니다.",
        },
        data: null,
    })
    public async handleSocialAdditionalInfo(
        @Body() body: SocialAdditionalInfoRequest,
    ): Promise<ApiResponse<SocialAdditionalInfoResponse>> {
        console.log(
            `유저 ID ${body.userId} 번 소셜 사용자의 추가 프로필 등록을 처리합니다.`,
        );
        console.log("body:", body);

        const result = await socialAdditionalInfo(body);
        return success(result);
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
                reason: "인증 정보가 유효하지 않거나 유실되었습니다.",
            },
            data: null,
        },
    )
    public async handleMypage(
        @Request() req: ExpressRequest,
    ): Promise<ApiResponse<{ username: string; message: string }>> {
        // 🔥 비인증 접근 시 가드 처리
        if (!req.user) {
            this.setStatus(StatusCodes.UNAUTHORIZED);
            throw new Error(
                "마이페이지에 접근할 권한이 없습니다. 로그인이 필요합니다.",
            );
        }

        const currentUsername =
            req.user?.username ||
            req.user?.name ||
            req.cookies?.username ||
            "인증된 사용자";

        return success({
            username: currentUsername,
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
     * @summary 로그아웃 API (인증 필요)
     */
    @Get("set-logout")
    @Middlewares(authorizeUser())
    @SuccessResponse(200, "로그아웃 성공")
    public async handleSetLogout(
        @Request() req: ExpressRequest,
    ): Promise<ApiResponse<string>> {
        // 🔥 비인증 접근 시 가드 처리
        if (!req.user) {
            this.setStatus(StatusCodes.UNAUTHORIZED);
            throw new Error("이미 로그아웃 되었거나 잘못된 접근입니다.");
        }

        req.res!.clearCookie("username");
        return success("로그아웃 완료 (인증 정보 해제).");
    }
}
