import {
 Body,
 Controller,
 Post,
 Path,
 Route,
 Tags,
 SuccessResponse,
} from "tsoa";
import { StatusCodes } from "http-status-codes";
import { createReview } from "../services/review.service.js";
import { ApiResponse, success } from "../../../common/responses/response.js";
// ReviewRequest와 ReviewResponse는 DTO 파일에서 정의되었다고 가정합니다.
import { ReviewRequest, ReviewResponse } from "../dtos/review.dto.js";

@Route("restaurants") // 루트 경로 설정
@Tags("Review") // Swagger 문서상의 태그
export class ReviewController extends Controller {
 /**
  * 식당에 리뷰를 등록하는 엔드포인트입니다.
  * @param restaurantId 식당 ID (경로 변수)
  * @param body 리뷰 내용 (Request Body)
  */
 @SuccessResponse(StatusCodes.CREATED, "Created") // 성공 시 상태 코드 설정
 @Post("{restaurantId}/reviews") // 최종 경로: /api/v1/restaurants/{restaurantId}/reviews
 public async handleReviewCreate(
  @Path() restaurantId: number, // req.params.restaurantId를 자동으로 숫자로 파싱
  @Body() body: ReviewRequest, // req.body를 자동으로 파싱
 ): Promise<ApiResponse<ReviewResponse>> {
  console.log(`식당 ID ${restaurantId}에 리뷰 생성을 요청했습니다.`);

  // 서비스 로직 호출
  const result = await createReview(restaurantId, body);

  // 응답 상태 코드를 201(Created)로 설정 (tsoa 전용 메서드)
  this.setStatus(StatusCodes.CREATED);

  // 규격화된 성공 응답 반환
  return success(result);
 }
}
