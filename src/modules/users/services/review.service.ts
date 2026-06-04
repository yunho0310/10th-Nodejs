import { addReview, getReview } from "../repositories/review.repository.js";
import { responseFromReview } from "../dtos/review.dto.js";

/**
 * 식당에 새로운 리뷰를 등록하고 결과를 반환합니다.
 * @param restaurantId 식당 ID
 * @param userId 인증 미들웨어에서 추출한 유저 ID
 * @param data 컨트롤러로부터 전달받은 리뷰 내용 및 점수
 */
export const createReview = async (
    restaurantId: number,
    userId: number,
    data: any,
) => {
    // 1. 레포지토리가 요구하는 데이터 규격에 인증된 userId를 결합하여 저장
    const reviewId = await addReview(restaurantId, {
        ...data,
        userId: userId,
    });

    // 2. 저장된 리뷰 데이터 가져오기
    const review = await getReview(reviewId);

    // 3. DTO를 통해 응답 형식으로 변환하여 반환
    return responseFromReview(review);
};
