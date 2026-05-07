export interface ReviewDetailResponse {
  nickname: string;
  score: number;
  createdAt: string;
  content: string;
}

export interface ReviewListResponse {
  reviews: ReviewDetailResponse[];
  nextCursor: number | null;
  isLast: boolean;
}

export const responseFromList = (
  reviews: any[],
  limit: number,
): ReviewListResponse => {
  const isLast = reviews.length <= limit;
  const displayReviews = isLast ? reviews : reviews.slice(0, limit);

  return {
    reviews: displayReviews.map((r) => ({
      nickname: r.nickname,
      score: r.score,
      // 날짜를 YYYY. MM. DD. 형식으로 변환
      createdAt: new Date(r.created_at).toLocaleDateString(),
      content: r.content,
    })),
    nextCursor: !isLast ? reviews[limit - 1].id : null,
    isLast: isLast,
  };
};
