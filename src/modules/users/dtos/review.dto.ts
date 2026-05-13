export interface ReviewRequest {
 body: string; // content에서 변경
 score: number;
}

export interface ReviewResponse {
 reviewId: number;
 userId: number;
 restaurantId: number;
 body: string; // content에서 변경
 score: number;
 createdAt: string;
}

/**
 * DB 데이터(Any)를 ReviewResponse 규격으로 변환하는 함수
 */
export const responseFromReview = (data: any): ReviewResponse => {
 return {
  reviewId: data.id,
  userId: data.userId || data.user_id, // Prisma 모델 필드명과 DB 컬럼명 모두 대응

  // restaurant_id가 BigInt일 수 있으므로 Number로 안전하게 변환
  restaurantId: data.restaurantId
   ? Number(data.restaurantId)
   : Number(data.restaurant_id),

  // DB의 body 컬럼 값을 DTO의 body 필드로 매핑
  body: data.body,

  score: data.score,

  // Date 객체일 경우 ISO 문자열로 변환
  createdAt:
   data.createdAt instanceof Date
    ? data.createdAt.toISOString()
    : data.created_at instanceof Date
      ? data.created_at.toISOString()
      : data.createdAt,
 };
};
