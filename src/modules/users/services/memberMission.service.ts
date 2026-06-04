import {
    isMissionChallenging,
    addMemberMission,
    getMemberMission,
} from "../repositories/memberMission.repository.js";
import { AlreadyChallenging } from "../../../common/errors/error.js";

/**
 * 사용자가 특정 미션에 도전하는 비즈니스 로직
 * @param memberId 인증된 회원의 고유 ID
 * @param missionId 도전할 미션 ID
 */
export const challengeMission = async (memberId: number, missionId: number) => {
    // 1. 중복 도전 여부 확인
    const alreadyChallenging = await isMissionChallenging(memberId, missionId);

    if (alreadyChallenging) {
        throw new AlreadyChallenging("이미 도전중인 미션입니다.");
    }

    // 2. 미션 도전 데이터 추가
    const memberMissionId = await addMemberMission(memberId, missionId);

    // 3. 조회 및 반환
    return await getMemberMission(memberMissionId);
};
