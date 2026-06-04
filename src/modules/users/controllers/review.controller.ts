import {
    Body,
    Controller,
    Post,
    Path,
    Route,
    Tags,
    SuccessResponse,
    Middlewares,
    Request,
} from "tsoa";
import { StatusCodes } from "http-status-codes";
import { createReview } from "../services/review.service.js";
import { ApiResponse, success } from "../../../common/responses/response.js";
import { authorizeUser } from "../../../common/middlewares/auth.middleware.js";
import { Request as ExpressRequest } from "express";
import { ReviewRequest, ReviewResponse } from "../dtos/review.dto.js";

@Route("restaurants")
@Tags("Review")
export class ReviewController extends Controller {
    /**
     * 식당에 리뷰를 등록하는 엔드포인트입니다.
     * @param restaurantId 식당 ID (경로 변수)
     * @param body 리뷰 내용 (Request Body)
     */
    @SuccessResponse(StatusCodes.CREATED, "Created")
    @Post("{restaurantId}/reviews")
    @Middlewares(authorizeUser()) // 로그인 인증 필수 보호막 추가
    public async handleReviewCreate(
        @Path() restaurantId: number,
        @Body() body: ReviewRequest,
        @Request() req: ExpressRequest, // 인증 객체 주입
    ): Promise<ApiResponse<ReviewResponse>> {
        console.log(`식당 ID ${restaurantId}에 리뷰 생성을 요청했습니다.`);

        // 인증 미들웨어에서 추출된 신뢰할 수 있는 유저 고유 PK 사용
        const userId = req.user?.id;

        // 서비스 레이어 호출 시 userId를 명확히 포함하여 전달
        const result = await createReview(restaurantId, userId, body);

        // 응답 상태 코드를 201(Created)로 설정
        this.setStatus(StatusCodes.CREATED);

        // 규격화된 성공 응답 반환
        return success(result);
    }
}
