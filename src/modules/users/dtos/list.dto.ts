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

// 특정 가게의 미션 목록 응답
export const responseFromStoreMissions = (missions: any[]) => {
  return missions.map((m) => ({
    id: m.id,
    reward: m.reward,
    deadline: m.deadline
      ? new Date(m.deadline).toLocaleDateString()
      : "기한 없음",
    missionSpec: m.mission_spec,
  }));
};

// 내가 진행 중인 미션 목록 응답
export const responseFromMyMissions = (myMissions: any[]) => {
  return myMissions.map((mm) => ({
    memberMissionId: mm.id,
    missionId: mm.mission.id,
    storeName: mm.mission.store.name,
    missionSpec: mm.mission.mission_spec,
    reward: mm.mission.reward,
    status: mm.status, // CHALLENGING
  }));
};
