/** 리뷰 상세 정보 (리스트 내 개별 항목) */
export interface ReviewDetailResponse {
 nickname: string;
 score: number;
 createdAt: string;
 content: string;
}

/** 리뷰 목록 조회 응답 (페이이션 포함) */
export interface ReviewListResponse {
 reviews: ReviewDetailResponse[];
 nextCursor: number | null;
 isLast: boolean;
}

/** [변환 함수] DB 리뷰 리스트 -> ReviewListResponse */
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
   // 날짜 형식을 "2026. 5. 12."와 같은 형태로 변환
   createdAt: new Date(r.created_at).toLocaleDateString(),
   content: r.content,
  })),
  // 다음 데이터가 있다면 마지막 항목의 ID를 커서로 사용
  nextCursor: !isLast ? reviews[limit - 1].id : null,
  isLast: isLast,
 };
};

/** 미션 도전 요청 */
export interface MissionChallengeRequest {
 memberId: number;
}

/** 미션 도전 결과 및 내 미션 정보 */
export interface MyMissionResponse {
 memberMissionId: number;
 missionId: number;
 storeName: string;
 missionSpec: string;
 reward: number;
 status: string; // 예: "CHALLENGING", "COMPLETE"
}

/** [변환 함수] DB 유저 미션 데이터 -> MyMissionResponse[] */
export const responseFromMyMissions = (
 myMissions: any[],
): MyMissionResponse[] => {
 return myMissions.map((mm) => ({
  memberMissionId: mm.id,
  missionId: mm.mission.id,
  storeName: mm.mission.store.name,
  missionSpec: mm.mission.mission_spec,
  reward: mm.mission.reward,
  status: mm.status,
 }));
};

/** [변환 함수] 단일 미션 도전 결과 변환 */
export const responseFromMemberMission = (data: any) => {
 return {
  memberMissionId: data.id,
  memberId: data.member_id,
  missionId: data.mission_id,
  status: data.status,
  createdAt:
   data.created_at instanceof Date
    ? data.created_at.toISOString()
    : data.created_at,
 };
};
/** 미션 생성 요청 (Request Body) */
export interface MissionRequest {
 content: string;
 reward: number;
 deadline: string;
}

/** 특정 가게의 미션 목록 응답용 */
export interface StoreMissionResponse {
 id: number;
 reward: number;
 deadline: string;
 missionSpec: string;
}

/** [변환 함수] DB 미션 리스트 -> StoreMissionResponse[] */
export const responseFromStoreMissions = (
 missions: any[],
): StoreMissionResponse[] => {
 return missions.map((m) => ({
  id: m.id,
  reward: m.reward,
  deadline: m.deadline
   ? new Date(m.deadline).toLocaleDateString()
   : "기한 없음",
  missionSpec: m.mission_spec,
 }));
};
