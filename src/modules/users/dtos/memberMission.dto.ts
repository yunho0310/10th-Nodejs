// 클라이언트가 미션 도전을 요청할 때 보내는 데이터 (Request)
export interface MissionChallengeRequest {
 memberId: number; // 어떤 유저가 도전하는지
}

// 서버가 미션 도전 결과를 응답할 때 보내는 데이터 (Response)
export interface MissionChallengeResponse {
 memberMissionId: number;
 memberId: number;
 missionId: number;
 /**
  * 미션의 현재 상태
  * 예: "CHALLENGING", "COMPLETE", "FAILED"
  */
 status: string;
 /**
  * 생성 시간 (ISO 8601 문자열 형식 권장)
  */
 createdAt: string;
}

/**
 * DB에서 가져온 raw 데이터를 Response DTO 규격으로 변환하는 함수
 */
export const responseFromMemberMission = (
 data: any,
): MissionChallengeResponse => {
 return {
  memberMissionId: data.id,
  memberId: data.member_id,
  missionId: data.mission_id,
  status: data.status,
  // Date 객체를 프론트엔드가 쓰기 편한 문자열로 변환
  createdAt:
   data.created_at instanceof Date
    ? data.created_at.toISOString()
    : data.created_at,
 };
};
