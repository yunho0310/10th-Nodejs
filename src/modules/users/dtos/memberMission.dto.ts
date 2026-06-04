// 클라이언트가 미션 도전을 요청할 때 보내는 데이터 (Request)
// 이제 토큰인증 방식을 사용하므로 Body는 비워둡니다.
export interface MissionChallengeRequest {
    // memberId 제거
}

// 서버가 미션 도전 결과를 응답할 때 보내는 데이터 (Response)
export interface MissionChallengeResponse {
    memberMissionId: number;
    memberId: number;
    missionId: number;
    /**
     * 미션의 현재 상태
     * 예: \"CHALLENGING\", \"COMPLETE\", \"FAILED\"
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
        memberId: data.memberId ?? data.member_id,
        missionId: data.missionId ?? data.mission_id,
        status: data.status,
        // Date 객체를 프론트엔드가 쓰기 편한 문자열로 변환
        createdAt:
            data.created_at instanceof Date
                ? data.created_at.toISOString()
                : data.createdAt instanceof Date
                  ? data.createdAt.toISOString()
                  : data.createdAt,
    };
};
